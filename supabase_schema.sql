-- Enable UUID extension if not already enabled
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. Create Resume table
CREATE TABLE IF NOT EXISTS public."Resume" (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    "userId" UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    content JSONB NOT NULL,
    "isOriginal" BOOLEAN DEFAULT FALSE,
    "createdAt" TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    "updatedAt" TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. Create JobDescription table
CREATE TABLE IF NOT EXISTS public."JobDescription" (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    "userId" UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    company TEXT NOT NULL,
    description TEXT NOT NULL,
    url TEXT,
    "extractedSkills" JSONB,
    "matchScore" INTEGER,
    "createdAt" TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    "updatedAt" TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. Create CoverLetter table
CREATE TABLE IF NOT EXISTS public."CoverLetter" (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    "userId" UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    "jobId" UUID NOT NULL REFERENCES public."JobDescription"(id) ON DELETE CASCADE,
    content TEXT NOT NULL,
    tone TEXT NOT NULL,
    "createdAt" TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    "updatedAt" TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 4. Create Application table
CREATE TABLE IF NOT EXISTS public."Application" (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    "userId" UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    "jobId" UUID NOT NULL REFERENCES public."JobDescription"(id) ON DELETE CASCADE,
    "resumeId" UUID REFERENCES public."Resume"(id) ON DELETE SET NULL,
    "coverLetterId" UUID REFERENCES public."CoverLetter"(id) ON DELETE SET NULL,
    status TEXT NOT NULL,
    "submissionMethod" TEXT,
    "appliedAt" TIMESTAMP WITH TIME ZONE,
    "createdAt" TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    "updatedAt" TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable Row Level Security
ALTER TABLE public."Resume" ENABLE ROW LEVEL SECURITY;
ALTER TABLE public."JobDescription" ENABLE ROW LEVEL SECURITY;
ALTER TABLE public."CoverLetter" ENABLE ROW LEVEL SECURITY;
ALTER TABLE public."Application" ENABLE ROW LEVEL SECURITY;

-- Create Policies (Users can only access their own data)
CREATE POLICY "Users can manage their own resumes" 
    ON public."Resume" FOR ALL 
    USING (auth.uid() = "userId");

CREATE POLICY "Users can manage their own job descriptions" 
    ON public."JobDescription" FOR ALL 
    USING (auth.uid() = "userId");

CREATE POLICY "Users can manage their own cover letters" 
    ON public."CoverLetter" FOR ALL 
    USING (auth.uid() = "userId");

CREATE POLICY "Users can manage their own applications" 
    ON public."Application" FOR ALL 
    USING (auth.uid() = "userId");
