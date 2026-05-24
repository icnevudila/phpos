-- Supabase Multi-Tenant Schema for DentQL
-- Enables strict row-level security (RLS) based on clinic_id

-- 1. Create Core Tables

-- Clinics (Tenants)
CREATE TABLE public.clinics (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    slug TEXT UNIQUE NOT NULL,
    name TEXT NOT NULL,
    address TEXT,
    city TEXT,
    phone TEXT,
    logo_url TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Profiles (Extends auth.users for multi-tenancy and RBAC)
CREATE TABLE public.profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    clinic_id UUID REFERENCES public.clinics(id) ON DELETE RESTRICT,
    role TEXT NOT NULL CHECK (role IN ('ADMIN', 'DENTIST', 'STAFF')),
    name TEXT NOT NULL,
    email TEXT NOT NULL,
    phone TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Patients
CREATE TABLE public.patients (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    clinic_id UUID NOT NULL REFERENCES public.clinics(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    email TEXT,
    phone TEXT,
    dob DATE,
    balance NUMERIC(10,2) DEFAULT 0.00 NOT NULL,
    status TEXT DEFAULT 'ACTIVE' CHECK (status IN ('ACTIVE', 'ARCHIVED')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Appointments
CREATE TABLE public.appointments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    clinic_id UUID NOT NULL REFERENCES public.clinics(id) ON DELETE CASCADE,
    patient_id UUID NOT NULL REFERENCES public.patients(id) ON DELETE CASCADE,
    provider_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    appointment_date DATE NOT NULL,
    start_time TIME NOT NULL,
    duration_minutes INTEGER DEFAULT 30,
    status TEXT DEFAULT 'BOOKED' CHECK (status IN ('BOOKED', 'WAITING', 'TRIAGE', 'IN_CHAIR', 'COMPLETED', 'NO_SHOW', 'CANCELLED')),
    type TEXT,
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Invoices
CREATE TABLE public.invoices (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    clinic_id UUID NOT NULL REFERENCES public.clinics(id) ON DELETE CASCADE,
    patient_id UUID NOT NULL REFERENCES public.patients(id) ON DELETE CASCADE,
    total NUMERIC(10,2) DEFAULT 0.00 NOT NULL,
    balance NUMERIC(10,2) DEFAULT 0.00 NOT NULL,
    status TEXT DEFAULT 'DRAFT' CHECK (status IN ('DRAFT', 'ISSUED', 'PARTIAL', 'PAID', 'VOID')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Invoice Items
CREATE TABLE public.invoice_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    invoice_id UUID NOT NULL REFERENCES public.invoices(id) ON DELETE CASCADE,
    description TEXT NOT NULL,
    price NUMERIC(10,2) NOT NULL,
    qty INTEGER DEFAULT 1 NOT NULL
);

-- Payments
CREATE TABLE public.payments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    invoice_id UUID NOT NULL REFERENCES public.invoices(id) ON DELETE CASCADE,
    clinic_id UUID NOT NULL REFERENCES public.clinics(id) ON DELETE CASCADE,
    amount NUMERIC(10,2) NOT NULL,
    method TEXT NOT NULL,
    payment_date TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Inventory
CREATE TABLE public.inventory_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    clinic_id UUID NOT NULL REFERENCES public.clinics(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    sku TEXT,
    stock_qty INTEGER DEFAULT 0 NOT NULL,
    low_stock_threshold INTEGER DEFAULT 10,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 2. Row Level Security (RLS) Setup

ALTER TABLE public.clinics ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.patients ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.appointments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.invoices ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.invoice_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.inventory_items ENABLE ROW LEVEL SECURITY;

-- Helper function to get current user's clinic_id
CREATE OR REPLACE FUNCTION public.get_current_clinic_id()
RETURNS UUID AS $$
    SELECT clinic_id FROM public.profiles WHERE id = auth.uid() LIMIT 1;
$$ LANGUAGE sql STABLE;

-- RLS Policies

-- Clinics: Users can only see their own clinic
CREATE POLICY "Users can view their own clinic" ON public.clinics
    FOR SELECT USING (id = public.get_current_clinic_id());

CREATE POLICY "Admins can update their clinic" ON public.clinics
    FOR UPDATE USING (
        id = public.get_current_clinic_id() AND 
        (SELECT role FROM public.profiles WHERE id = auth.uid()) = 'ADMIN'
    );

-- Profiles: Users can see profiles in their clinic
CREATE POLICY "Users can view profiles in their clinic" ON public.profiles
    FOR SELECT USING (clinic_id = public.get_current_clinic_id());

-- Generic tenant isolation policy (applied to patients, appointments, invoices, etc.)
-- Note: Replace TABLE_NAME in execution script or apply manually
CREATE POLICY "Tenant isolation for patients" ON public.patients
    FOR ALL USING (clinic_id = public.get_current_clinic_id());

CREATE POLICY "Tenant isolation for appointments" ON public.appointments
    FOR ALL USING (clinic_id = public.get_current_clinic_id());

CREATE POLICY "Tenant isolation for invoices" ON public.invoices
    FOR ALL USING (clinic_id = public.get_current_clinic_id());

CREATE POLICY "Tenant isolation for invoice_items" ON public.invoice_items
    FOR ALL USING (
        invoice_id IN (SELECT id FROM public.invoices WHERE clinic_id = public.get_current_clinic_id())
    );

CREATE POLICY "Tenant isolation for payments" ON public.payments
    FOR ALL USING (clinic_id = public.get_current_clinic_id());

CREATE POLICY "Tenant isolation for inventory" ON public.inventory_items
    FOR ALL USING (clinic_id = public.get_current_clinic_id());

-- 3. Triggers for Balance Automation
-- Update invoice balance when payment is inserted
CREATE OR REPLACE FUNCTION update_invoice_balance()
RETURNS TRIGGER AS $$
BEGIN
    UPDATE public.invoices 
    SET balance = GREATEST(0, balance - NEW.amount),
        status = CASE WHEN GREATEST(0, balance - NEW.amount) = 0 THEN 'PAID' ELSE 'PARTIAL' END
    WHERE id = NEW.invoice_id;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER on_payment_inserted
AFTER INSERT ON public.payments
FOR EACH ROW EXECUTE FUNCTION update_invoice_balance();
