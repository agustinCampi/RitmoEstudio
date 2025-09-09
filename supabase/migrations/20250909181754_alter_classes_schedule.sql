-- Add new schedule columns
ALTER TABLE public.classes
ADD COLUMN day_of_week text NOT NULL DEFAULT 'Lunes', -- Or your preferred default
ADD COLUMN start_time time with time zone NOT NULL DEFAULT '10:00:00+00',
ADD COLUMN end_time time with time zone NOT NULL DEFAULT '11:00:00+00';

-- We can't easily migrate data from a single string to three distinct columns,
-- so we will just remove the old column for now.
-- In a real-world scenario, you might write a script to parse the old `schedule` 
-- string and populate the new columns before dropping it.
ALTER TABLE public.classes
DROP COLUMN schedule;

-- Add a check constraint to ensure the end time is after the start time
ALTER TABLE public.classes
ADD CONSTRAINT time_check CHECK (end_time > start_time);

-- Create an index on teacher_id and the new time columns for faster lookups
CREATE INDEX idx_classes_teacher_schedule ON public.classes (teacher_id, day_of_week, start_time);

COMMENT ON COLUMN public.classes.day_of_week IS 'Day of the week the class is held.';
COMMENT ON COLUMN public.classes.start_time IS 'Time the class starts.';
COMMENT ON COLUMN public.classes.end_time IS 'Time the class ends.';
