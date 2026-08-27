CREATE TABLE IF NOT EXISTS "admin_notifications" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"read" boolean DEFAULT false NOT NULL,
	"type" text DEFAULT 'info' NOT NULL,
	"title" text DEFAULT 'Ny notis' NOT NULL,
	"message" text DEFAULT '' NOT NULL,
	"request_id" text DEFAULT '' NOT NULL,
	"customer_id" uuid,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"read_at" timestamp with time zone
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "contact_requests" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"payload" jsonb NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "customer_messages" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"customer_id" uuid NOT NULL,
	"author" text NOT NULL,
	"text" text NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "customers" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"request_id" text,
	"source" text DEFAULT 'direct-membership' NOT NULL,
	"type" text DEFAULT 'membership' NOT NULL,
	"status" text DEFAULT 'pending_signature' NOT NULL,
	"name" text NOT NULL,
	"company" text DEFAULT '' NOT NULL,
	"email" text NOT NULL,
	"phone" text DEFAULT '' NOT NULL,
	"service" text DEFAULT '' NOT NULL,
	"service_label" text DEFAULT '' NOT NULL,
	"plan" text NOT NULL,
	"price" text DEFAULT '' NOT NULL,
	"billing_cycle" text DEFAULT 'per månad' NOT NULL,
	"project_title" text DEFAULT '' NOT NULL,
	"requirements" text DEFAULT '' NOT NULL,
	"admin_notes" text DEFAULT '' NOT NULL,
	"sign_token" text,
	"access_code" text NOT NULL,
	"signature_name" text DEFAULT '' NOT NULL,
	"signature_title" text DEFAULT '' NOT NULL,
	"signature_ip" text DEFAULT '' NOT NULL,
	"stripe_customer_id" text,
	"stripe_subscription_id" text,
	"stripe_checkout_session_id" text,
	"stripe_price_id" text,
	"subscription_status" text,
	"current_period_end" timestamp with time zone,
	"cancel_at_period_end" boolean DEFAULT false NOT NULL,
	"payment_method" jsonb,
	"signed_at" timestamp with time zone,
	"cancellation_requested_at" timestamp with time zone,
	"cancelled_at" timestamp with time zone,
	"cancellation_reason" text DEFAULT '' NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "customers_request_id_unique" UNIQUE("request_id"),
	CONSTRAINT "customers_email_unique" UNIQUE("email"),
	CONSTRAINT "customers_sign_token_unique" UNIQUE("sign_token"),
	CONSTRAINT "customers_stripe_customer_id_unique" UNIQUE("stripe_customer_id"),
	CONSTRAINT "customers_stripe_subscription_id_unique" UNIQUE("stripe_subscription_id"),
	CONSTRAINT "customers_stripe_checkout_session_id_unique" UNIQUE("stripe_checkout_session_id")
);
--> statement-breakpoint
DO $migration$
BEGIN
	IF NOT EXISTS (
		SELECT 1 FROM pg_constraint
		WHERE conname = 'admin_notifications_customer_id_customers_id_fk'
	) THEN
		ALTER TABLE "admin_notifications"
			ADD CONSTRAINT "admin_notifications_customer_id_customers_id_fk"
			FOREIGN KEY ("customer_id") REFERENCES "public"."customers"("id")
			ON DELETE set null ON UPDATE no action;
	END IF;
END
$migration$;--> statement-breakpoint
DO $migration$
BEGIN
	IF NOT EXISTS (
		SELECT 1 FROM pg_constraint
		WHERE conname = 'customer_messages_customer_id_customers_id_fk'
	) THEN
		ALTER TABLE "customer_messages"
			ADD CONSTRAINT "customer_messages_customer_id_customers_id_fk"
			FOREIGN KEY ("customer_id") REFERENCES "public"."customers"("id")
			ON DELETE cascade ON UPDATE no action;
	END IF;
END
$migration$;
