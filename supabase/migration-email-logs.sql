-- ============================================================
-- EMAIL LOGS — Tracabilité des envois + idempotence
--
-- Permet, pour CHAQUE commande, de savoir pour chaque email
-- (order_confirmation_customer / order_notification_admin) :
--   - statut : sent / failed / pending
--   - date & heure de tentative (created_at / updated_at)
--   - erreur éventuelle (error_message)
--   - identifiant / numéro de commande (order_id / order_number)
--   - ID du message fournisseur (message_id)
--
-- Exécuter dans : https://supabase.com/dashboard/project/xfsaznnrhqmlbllsfxzr/sql
-- ============================================================

CREATE TABLE IF NOT EXISTS public.email_logs (
    id             TEXT PRIMARY KEY,
    order_id       TEXT,
    order_number   TEXT,
    email_type     TEXT NOT NULL,
    recipient      TEXT NOT NULL,
    subject        TEXT,
    status         TEXT NOT NULL DEFAULT 'pending'
                   CHECK (status IN ('pending', 'sent', 'failed')),
    transport_used TEXT,
    error_message  TEXT,
    message_id     TEXT,
    metadata       JSONB DEFAULT '{}'::jsonb,
    created_at     TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at     TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_email_logs_order_number ON public.email_logs(order_number);
CREATE INDEX IF NOT EXISTS idx_email_logs_order_type ON public.email_logs(order_number, email_type, status);
CREATE INDEX IF NOT EXISTS idx_email_logs_created_at ON public.email_logs(created_at DESC);

-- Les écritures/lectures côté serveur utilisent le rôle service_role
-- (SUPABASE_SERVICE_ROLE_KEY), qui contourne RLS.
ALTER TABLE public.email_logs ENABLE ROW LEVEL SECURITY;

-- Seuls les admins / managers / support (connectés via l'app) peuvent
-- consulter les logs d'emails via l'API publique.
CREATE POLICY "Admins can read email logs" ON public.email_logs FOR SELECT USING (
    EXISTS (
        SELECT 1 FROM public.profiles
        WHERE id::text = auth.uid()::text AND role IN ('admin', 'manager', 'support')
    )
);