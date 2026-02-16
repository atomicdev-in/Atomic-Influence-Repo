-- =====================================================
-- Brand Ownership & Team Management Logic
-- =====================================================
-- 1. Creates automatic Brand Admin assignment on brand creation
-- 2. Adds ownership transfer capability for Super Admins
-- =====================================================

-- 1. Create a function to automatically assign brand admin role on brand creation
CREATE OR REPLACE FUNCTION public.assign_brand_admin_on_create()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
    -- Insert the creator as agency_admin in brand_user_roles
    INSERT INTO public.brand_user_roles (user_id, brand_id, role)
    VALUES (NEW.user_id, NEW.id, 'agency_admin')
    ON CONFLICT (user_id, brand_id) DO NOTHING;
    
    -- Also create a brand_membership entry with is_default = true
    INSERT INTO public.brand_memberships (user_id, brand_id, role, is_default)
    VALUES (NEW.user_id, NEW.id, 'agency_admin', true)
    ON CONFLICT (user_id, brand_id) DO NOTHING;
    
    -- Log to audit_logs
    INSERT INTO public.audit_logs (user_id, action, entity_type, entity_id, new_value)
    VALUES (
        NEW.user_id,
        'brand_ownership_assigned',
        'brand_profile',
        NEW.id,
        jsonb_build_object('brand_id', NEW.id, 'owner_user_id', NEW.user_id, 'role', 'agency_admin')
    );
    
    RETURN NEW;
END;
$$;

-- 2. Create the trigger on brand_profiles
DROP TRIGGER IF EXISTS on_brand_created_assign_admin ON public.brand_profiles;

CREATE TRIGGER on_brand_created_assign_admin
    AFTER INSERT ON public.brand_profiles
    FOR EACH ROW
    EXECUTE FUNCTION public.assign_brand_admin_on_create();

-- 3. Create a unique constraint on brand_user_roles to prevent duplicate user-brand pairs
-- First check if it exists
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint 
        WHERE conname = 'brand_user_roles_user_brand_unique'
    ) THEN
        ALTER TABLE public.brand_user_roles 
        ADD CONSTRAINT brand_user_roles_user_brand_unique 
        UNIQUE (user_id, brand_id);
    END IF;
END $$;

-- 4. Create a unique constraint on brand_memberships to prevent duplicate user-brand pairs
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint 
        WHERE conname = 'brand_memberships_user_brand_unique'
    ) THEN
        ALTER TABLE public.brand_memberships 
        ADD CONSTRAINT brand_memberships_user_brand_unique 
        UNIQUE (user_id, brand_id);
    END IF;
END $$;

-- 5. Create a function for Super Admins to transfer brand ownership
CREATE OR REPLACE FUNCTION public.transfer_brand_ownership(
    _brand_id uuid,
    _new_owner_user_id uuid,
    _performed_by uuid
)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    _old_owner_id uuid;
BEGIN
    -- Verify the caller is a system admin
    IF NOT is_admin(_performed_by) THEN
        RAISE EXCEPTION 'Only Super Admins can transfer brand ownership';
    END IF;
    
    -- Get current owner
    SELECT user_id INTO _old_owner_id
    FROM public.brand_profiles
    WHERE id = _brand_id;
    
    IF _old_owner_id IS NULL THEN
        RAISE EXCEPTION 'Brand not found';
    END IF;
    
    IF _old_owner_id = _new_owner_user_id THEN
        RAISE EXCEPTION 'User is already the brand owner';
    END IF;
    
    -- Update brand_profiles ownership
    UPDATE public.brand_profiles
    SET user_id = _new_owner_user_id, updated_at = now()
    WHERE id = _brand_id;
    
    -- Ensure new owner has agency_admin role
    INSERT INTO public.brand_user_roles (user_id, brand_id, role)
    VALUES (_new_owner_user_id, _brand_id, 'agency_admin')
    ON CONFLICT (user_id, brand_id) 
    DO UPDATE SET role = 'agency_admin', updated_at = now();
    
    -- Ensure new owner has brand_membership
    INSERT INTO public.brand_memberships (user_id, brand_id, role, is_default)
    VALUES (_new_owner_user_id, _brand_id, 'agency_admin', true)
    ON CONFLICT (user_id, brand_id) 
    DO UPDATE SET role = 'agency_admin', is_default = true, updated_at = now();
    
    -- Update old owner's default brand if this was their default
    UPDATE public.brand_memberships
    SET is_default = false
    WHERE user_id = _old_owner_id AND brand_id = _brand_id;
    
    -- Log the ownership transfer
    INSERT INTO public.audit_logs (user_id, action, entity_type, entity_id, old_value, new_value, metadata)
    VALUES (
        _performed_by,
        'brand_ownership_transferred',
        'brand_profile',
        _brand_id,
        jsonb_build_object('owner_user_id', _old_owner_id),
        jsonb_build_object('owner_user_id', _new_owner_user_id),
        jsonb_build_object('transferred_by', _performed_by)
    );
    
    RETURN true;
END;
$$;

-- 6. Grant execute permission to authenticated users (will be checked inside function)
GRANT EXECUTE ON FUNCTION public.transfer_brand_ownership(uuid, uuid, uuid) TO authenticated;

-- 7. Backfill existing brands - ensure all brand owners have agency_admin role
INSERT INTO public.brand_user_roles (user_id, brand_id, role)
SELECT user_id, id, 'agency_admin'
FROM public.brand_profiles
WHERE NOT EXISTS (
    SELECT 1 FROM public.brand_user_roles bur
    WHERE bur.user_id = brand_profiles.user_id 
    AND bur.brand_id = brand_profiles.id
)
ON CONFLICT DO NOTHING;

-- 8. Backfill brand_memberships for existing brand owners
INSERT INTO public.brand_memberships (user_id, brand_id, role, is_default)
SELECT user_id, id, 'agency_admin', true
FROM public.brand_profiles
WHERE NOT EXISTS (
    SELECT 1 FROM public.brand_memberships bm
    WHERE bm.user_id = brand_profiles.user_id 
    AND bm.brand_id = brand_profiles.id
)
ON CONFLICT DO NOTHING;