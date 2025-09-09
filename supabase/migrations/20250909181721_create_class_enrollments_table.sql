CREATE TABLE public.class_enrollments (
    user_id uuid NOT NULL,
    class_id uuid NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    CONSTRAINT class_enrollments_pkey PRIMARY KEY (user_id, class_id),
    CONSTRAINT class_enrollments_class_id_fkey FOREIGN KEY (class_id) REFERENCES public.classes(id) ON DELETE CASCADE,
    -- Note: We reference auth.users here for the user ID
    CONSTRAINT class_enrollments_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE
);

ALTER TABLE public.class_enrollments ENABLE ROW LEVEL SECURITY;

COMMENT ON TABLE public.class_enrollments IS 'Tracks student enrollments in classes.';

-- Create policies for the class_enrollments table

-- Allow users to view their own enrollments
CREATE POLICY "Allow users to view their own enrollments" 
ON public.class_enrollments 
FOR SELECT 
USING (auth.uid() = user_id);

-- Allow users to create their own enrollments (enroll in a class)
CREATE POLICY "Allow users to create their own enrollments" 
ON public.class_enrollments 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

-- Allow users to delete their own enrollments (unenroll from a class)
CREATE POLICY "Allow users to delete their own enrollments" 
ON public.class_enrollments 
FOR DELETE 
USING (auth.uid() = user_id);

-- Allow admins to have full access
CREATE POLICY "Allow admin full access" 
ON public.class_enrollments 
FOR ALL 
USING (public.is_admin(auth.uid()));
