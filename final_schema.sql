

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;


CREATE EXTENSION IF NOT EXISTS "pg_net" WITH SCHEMA "extensions";






COMMENT ON SCHEMA "public" IS 'standard public schema';



CREATE EXTENSION IF NOT EXISTS "pg_graphql" WITH SCHEMA "graphql";






CREATE EXTENSION IF NOT EXISTS "pg_stat_statements" WITH SCHEMA "extensions";






CREATE EXTENSION IF NOT EXISTS "pgcrypto" WITH SCHEMA "extensions";






CREATE EXTENSION IF NOT EXISTS "pgjwt" WITH SCHEMA "extensions";






CREATE EXTENSION IF NOT EXISTS "supabase_vault" WITH SCHEMA "vault";






CREATE EXTENSION IF NOT EXISTS "uuid-ossp" WITH SCHEMA "extensions";






CREATE OR REPLACE FUNCTION "public"."create_profile_for_user"() RETURNS "trigger"
    LANGUAGE "plpgsql" SECURITY DEFINER
    AS $$
BEGIN
  INSERT INTO public.user_profiles (user_id, display_name, full_name)
  VALUES (NEW.id, COALESCE(NEW.raw_user_meta_data->>'full_name', split_part(NEW.email, '@', 1)), NEW.raw_user_meta_data->>'full_name');
  RETURN NEW;
END;
$$;


ALTER FUNCTION "public"."create_profile_for_user"() OWNER TO "postgres";

SET default_tablespace = '';

SET default_table_access_method = "heap";


CREATE TABLE IF NOT EXISTS "public"."cancellations" (
    "id" "uuid" DEFAULT "extensions"."uuid_generate_v4"() NOT NULL,
    "reservation_id" "uuid" NOT NULL,
    "user_id" "uuid" NOT NULL,
    "reason" "text",
    "refund_amount" integer,
    "refund_status" "text" DEFAULT 'pending'::"text" NOT NULL,
    "cancelled_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "updated_at" timestamp with time zone DEFAULT "now"() NOT NULL
);


ALTER TABLE "public"."cancellations" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."class_introductions" (
    "id" "uuid" NOT NULL,
    "class_id" "uuid",
    "title" character varying(255) NOT NULL,
    "description" "text" NOT NULL,
    "image_url" "text",
    "highlight_points" "jsonb",
    "curriculum" "jsonb",
    "benefits" "text",
    "target_audience" "text",
    "instructor_id" "uuid",
    "category" character varying(100),
    "duration_weeks" integer,
    "sessions_per_week" integer,
    "created_at" timestamp with time zone NOT NULL,
    "updated_at" timestamp with time zone NOT NULL
);


ALTER TABLE "public"."class_introductions" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."class_reservations" (
    "id" "uuid" NOT NULL,
    "user_id" "uuid" NOT NULL,
    "schedule_id" "uuid" NOT NULL,
    "session_id" "uuid",
    "status" "text" NOT NULL,
    "created_at" timestamp with time zone,
    "updated_at" timestamp with time zone
);


ALTER TABLE "public"."class_reservations" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."class_schedules" (
    "id" "uuid" DEFAULT "extensions"."uuid_generate_v4"() NOT NULL,
    "class_id" "uuid" NOT NULL,
    "start_time" timestamp with time zone NOT NULL,
    "end_time" timestamp with time zone NOT NULL,
    "max_participants" integer DEFAULT 10 NOT NULL,
    "current_participants" integer DEFAULT 0 NOT NULL,
    "status" "text" DEFAULT 'scheduled'::"text" NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "updated_at" timestamp with time zone DEFAULT "now"() NOT NULL
);


ALTER TABLE "public"."class_schedules" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."classes" (
    "id" "uuid" DEFAULT "extensions"."uuid_generate_v4"() NOT NULL,
    "title" "text" NOT NULL,
    "description" "text",
    "instructor_id" "uuid",
    "max_participants" integer DEFAULT 10 NOT NULL,
    "price" integer DEFAULT 0 NOT NULL,
    "duration" integer NOT NULL,
    "category" "text",
    "thumbnail_url" "text",
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "updated_at" timestamp with time zone DEFAULT "now"() NOT NULL
);


ALTER TABLE "public"."classes" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."file_attachments" (
    "id" "uuid" NOT NULL,
    "submission_id" "uuid",
    "file_url" "text" NOT NULL,
    "file_name" character varying(255) NOT NULL,
    "file_type" character varying(100) NOT NULL,
    "file_size" integer NOT NULL,
    "created_at" timestamp with time zone NOT NULL
);


ALTER TABLE "public"."file_attachments" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."form_responses" (
    "id" "uuid" DEFAULT "extensions"."uuid_generate_v4"() NOT NULL,
    "template_id" "uuid" NOT NULL,
    "user_id" "uuid" NOT NULL,
    "responses" "jsonb" NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "updated_at" timestamp with time zone DEFAULT "now"() NOT NULL
);


ALTER TABLE "public"."form_responses" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."form_submissions" (
    "id" "uuid" NOT NULL,
    "template_id" "uuid",
    "user_id" "uuid",
    "data" "jsonb" NOT NULL,
    "status" character varying(20) NOT NULL,
    "admin_notes" "text",
    "created_at" timestamp with time zone NOT NULL,
    "updated_at" timestamp with time zone NOT NULL
);


ALTER TABLE "public"."form_submissions" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."form_templates" (
    "id" "uuid" DEFAULT "extensions"."uuid_generate_v4"() NOT NULL,
    "title" "text" NOT NULL,
    "description" "text",
    "schema" "jsonb" NOT NULL,
    "created_by" "uuid",
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "updated_at" timestamp with time zone DEFAULT "now"() NOT NULL
);


ALTER TABLE "public"."form_templates" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."gallery_categories" (
    "id" "uuid" NOT NULL,
    "name" "text" NOT NULL,
    "description" "text",
    "created_at" timestamp with time zone,
    "updated_at" timestamp with time zone
);


ALTER TABLE "public"."gallery_categories" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."gallery_items" (
    "id" "uuid" NOT NULL,
    "title" "text" NOT NULL,
    "description" "text",
    "image_url" "text" NOT NULL,
    "category_id" "uuid",
    "is_featured" boolean,
    "display_order" integer,
    "created_at" timestamp with time zone,
    "updated_at" timestamp with time zone
);


ALTER TABLE "public"."gallery_items" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."inquiries" (
    "id" "uuid" DEFAULT "extensions"."uuid_generate_v4"() NOT NULL,
    "user_id" "uuid" NOT NULL,
    "subject" "text" NOT NULL,
    "content" "text" NOT NULL,
    "status" "text" DEFAULT 'pending'::"text" NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "updated_at" timestamp with time zone DEFAULT "now"() NOT NULL
);


ALTER TABLE "public"."inquiries" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."inquiry_attachments" (
    "id" "uuid" NOT NULL,
    "inquiry_id" "uuid" NOT NULL,
    "file_name" "text" NOT NULL,
    "file_path" "text" NOT NULL,
    "file_size" integer NOT NULL,
    "file_type" "text",
    "created_at" timestamp with time zone
);


ALTER TABLE "public"."inquiry_attachments" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."inquiry_responses" (
    "id" "uuid" DEFAULT "extensions"."uuid_generate_v4"() NOT NULL,
    "inquiry_id" "uuid" NOT NULL,
    "responder_id" "uuid",
    "content" "text" NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "updated_at" timestamp with time zone DEFAULT "now"() NOT NULL
);


ALTER TABLE "public"."inquiry_responses" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."inquiry_templates" (
    "id" "uuid" NOT NULL,
    "title" "text" NOT NULL,
    "description" "text",
    "fields" "jsonb" NOT NULL,
    "is_active" boolean,
    "created_at" timestamp with time zone,
    "updated_at" timestamp with time zone
);


ALTER TABLE "public"."inquiry_templates" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."notifications" (
    "id" "uuid" NOT NULL,
    "user_id" "uuid" NOT NULL,
    "type" "text" NOT NULL,
    "title" "text" NOT NULL,
    "message" "text" NOT NULL,
    "data" "jsonb",
    "is_read" boolean NOT NULL,
    "created_at" timestamp with time zone,
    "read_at" timestamp with time zone
);


ALTER TABLE "public"."notifications" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."reservations" (
    "id" "uuid" DEFAULT "extensions"."uuid_generate_v4"() NOT NULL,
    "user_id" "uuid" NOT NULL,
    "class_id" "uuid" NOT NULL,
    "status" "text" DEFAULT 'pending'::"text" NOT NULL,
    "payment_status" "text" DEFAULT 'unpaid'::"text" NOT NULL,
    "reserved_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "start_time" timestamp with time zone NOT NULL,
    "end_time" timestamp with time zone NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "updated_at" timestamp with time zone DEFAULT "now"() NOT NULL
);


ALTER TABLE "public"."reservations" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."session_transactions" (
    "id" "uuid" NOT NULL,
    "user_session_id" "uuid",
    "user_id" "uuid" NOT NULL,
    "transaction_type" "text" NOT NULL,
    "amount_changed" integer NOT NULL,
    "reason" "text",
    "related_reservation_id" "uuid",
    "notes" "text",
    "created_at" timestamp with time zone
);


ALTER TABLE "public"."session_transactions" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."testimonials" (
    "id" "uuid" NOT NULL,
    "user_id" "uuid",
    "content" "text" NOT NULL,
    "rating" integer NOT NULL,
    "is_approved" boolean,
    "is_featured" boolean,
    "display_order" integer,
    "created_at" timestamp with time zone,
    "updated_at" timestamp with time zone
);


ALTER TABLE "public"."testimonials" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."user_profiles" (
    "id" "uuid" DEFAULT "extensions"."uuid_generate_v4"() NOT NULL,
    "user_id" "uuid",
    "display_name" "text" NOT NULL,
    "full_name" "text",
    "avatar_url" "text",
    "membership_level" "text" DEFAULT 'REGULAR'::"text" NOT NULL,
    "role" "text" DEFAULT 'user'::"text" NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "updated_at" timestamp with time zone DEFAULT "now"() NOT NULL
);


ALTER TABLE "public"."user_profiles" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."user_sessions" (
    "id" "uuid" NOT NULL,
    "user_id" "uuid" NOT NULL,
    "session_count" integer NOT NULL,
    "expiry_date" timestamp with time zone NOT NULL,
    "created_at" timestamp with time zone,
    "updated_at" timestamp with time zone
);


ALTER TABLE "public"."user_sessions" OWNER TO "postgres";


ALTER TABLE ONLY "public"."cancellations"
    ADD CONSTRAINT "cancellations_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."class_schedules"
    ADD CONSTRAINT "class_schedules_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."classes"
    ADD CONSTRAINT "classes_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."form_responses"
    ADD CONSTRAINT "form_responses_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."form_templates"
    ADD CONSTRAINT "form_templates_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."inquiries"
    ADD CONSTRAINT "inquiries_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."inquiry_responses"
    ADD CONSTRAINT "inquiry_responses_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."reservations"
    ADD CONSTRAINT "reservations_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."user_profiles"
    ADD CONSTRAINT "user_profiles_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."user_profiles"
    ADD CONSTRAINT "user_profiles_user_id_key" UNIQUE ("user_id");



CREATE INDEX "idx_class_schedules_class_id" ON "public"."class_schedules" USING "btree" ("class_id");



CREATE INDEX "idx_form_responses_template_id" ON "public"."form_responses" USING "btree" ("template_id");



CREATE INDEX "idx_form_responses_user_id" ON "public"."form_responses" USING "btree" ("user_id");



CREATE INDEX "idx_inquiries_user_id" ON "public"."inquiries" USING "btree" ("user_id");



CREATE INDEX "idx_reservations_class_id" ON "public"."reservations" USING "btree" ("class_id");



CREATE INDEX "idx_reservations_user_id" ON "public"."reservations" USING "btree" ("user_id");



ALTER TABLE ONLY "public"."cancellations"
    ADD CONSTRAINT "cancellations_reservation_id_fkey" FOREIGN KEY ("reservation_id") REFERENCES "public"."reservations"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."cancellations"
    ADD CONSTRAINT "cancellations_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "auth"."users"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."class_schedules"
    ADD CONSTRAINT "class_schedules_class_id_fkey" FOREIGN KEY ("class_id") REFERENCES "public"."classes"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."classes"
    ADD CONSTRAINT "classes_instructor_id_fkey" FOREIGN KEY ("instructor_id") REFERENCES "public"."user_profiles"("user_id");



ALTER TABLE ONLY "public"."form_responses"
    ADD CONSTRAINT "form_responses_template_id_fkey" FOREIGN KEY ("template_id") REFERENCES "public"."form_templates"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."form_responses"
    ADD CONSTRAINT "form_responses_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "auth"."users"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."form_templates"
    ADD CONSTRAINT "form_templates_created_by_fkey" FOREIGN KEY ("created_by") REFERENCES "auth"."users"("id");



ALTER TABLE ONLY "public"."inquiries"
    ADD CONSTRAINT "inquiries_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "auth"."users"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."inquiry_responses"
    ADD CONSTRAINT "inquiry_responses_inquiry_id_fkey" FOREIGN KEY ("inquiry_id") REFERENCES "public"."inquiries"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."inquiry_responses"
    ADD CONSTRAINT "inquiry_responses_responder_id_fkey" FOREIGN KEY ("responder_id") REFERENCES "auth"."users"("id");



ALTER TABLE ONLY "public"."reservations"
    ADD CONSTRAINT "reservations_class_id_fkey" FOREIGN KEY ("class_id") REFERENCES "public"."classes"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."reservations"
    ADD CONSTRAINT "reservations_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "auth"."users"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."user_profiles"
    ADD CONSTRAINT "user_profiles_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "auth"."users"("id") ON DELETE CASCADE;



ALTER TABLE "public"."cancellations" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."class_schedules" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."classes" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."form_responses" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."form_templates" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."inquiries" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."inquiry_responses" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."reservations" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."user_profiles" ENABLE ROW LEVEL SECURITY;


CREATE POLICY "개발 중 모든 접근 허용" ON "public"."cancellations" USING (true);



CREATE POLICY "개발 중 모든 접근 허용" ON "public"."class_schedules" USING (true);



CREATE POLICY "개발 중 모든 접근 허용" ON "public"."classes" USING (true);



CREATE POLICY "개발 중 모든 접근 허용" ON "public"."form_responses" USING (true);



CREATE POLICY "개발 중 모든 접근 허용" ON "public"."form_templates" USING (true);



CREATE POLICY "개발 중 모든 접근 허용" ON "public"."inquiries" USING (true);



CREATE POLICY "개발 중 모든 접근 허용" ON "public"."inquiry_responses" USING (true);



CREATE POLICY "개발 중 모든 접근 허용" ON "public"."reservations" USING (true);



CREATE POLICY "관리자는 모든 프로필을 볼 수 있음" ON "public"."user_profiles" FOR SELECT TO "authenticated" USING ((( SELECT "user_profiles_1"."role"
   FROM "public"."user_profiles" "user_profiles_1"
  WHERE ("user_profiles_1"."user_id" = "auth"."uid"())
 LIMIT 1) = 'admin'::"text"));



CREATE POLICY "모든 사용자에게 접근 허용" ON "public"."user_profiles" USING (true);



CREATE POLICY "사용자는 자신의 프로필을 생성할 수 있음" ON "public"."user_profiles" FOR INSERT WITH CHECK (("auth"."uid"() = "user_id"));



CREATE POLICY "서비스 롤은 프로필을 생성할 수 있음" ON "public"."user_profiles" FOR INSERT TO "service_role" WITH CHECK (true);





ALTER PUBLICATION "supabase_realtime" OWNER TO "postgres";





GRANT USAGE ON SCHEMA "public" TO "postgres";
GRANT USAGE ON SCHEMA "public" TO "anon";
GRANT USAGE ON SCHEMA "public" TO "authenticated";
GRANT USAGE ON SCHEMA "public" TO "service_role";

















































































































































































GRANT ALL ON FUNCTION "public"."create_profile_for_user"() TO "anon";
GRANT ALL ON FUNCTION "public"."create_profile_for_user"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."create_profile_for_user"() TO "service_role";


















GRANT ALL ON TABLE "public"."cancellations" TO "anon";
GRANT ALL ON TABLE "public"."cancellations" TO "authenticated";
GRANT ALL ON TABLE "public"."cancellations" TO "service_role";



GRANT ALL ON TABLE "public"."class_introductions" TO "anon";
GRANT ALL ON TABLE "public"."class_introductions" TO "authenticated";
GRANT ALL ON TABLE "public"."class_introductions" TO "service_role";



GRANT ALL ON TABLE "public"."class_reservations" TO "anon";
GRANT ALL ON TABLE "public"."class_reservations" TO "authenticated";
GRANT ALL ON TABLE "public"."class_reservations" TO "service_role";



GRANT ALL ON TABLE "public"."class_schedules" TO "anon";
GRANT ALL ON TABLE "public"."class_schedules" TO "authenticated";
GRANT ALL ON TABLE "public"."class_schedules" TO "service_role";



GRANT ALL ON TABLE "public"."classes" TO "anon";
GRANT ALL ON TABLE "public"."classes" TO "authenticated";
GRANT ALL ON TABLE "public"."classes" TO "service_role";



GRANT ALL ON TABLE "public"."file_attachments" TO "anon";
GRANT ALL ON TABLE "public"."file_attachments" TO "authenticated";
GRANT ALL ON TABLE "public"."file_attachments" TO "service_role";



GRANT ALL ON TABLE "public"."form_responses" TO "anon";
GRANT ALL ON TABLE "public"."form_responses" TO "authenticated";
GRANT ALL ON TABLE "public"."form_responses" TO "service_role";



GRANT ALL ON TABLE "public"."form_submissions" TO "anon";
GRANT ALL ON TABLE "public"."form_submissions" TO "authenticated";
GRANT ALL ON TABLE "public"."form_submissions" TO "service_role";



GRANT ALL ON TABLE "public"."form_templates" TO "anon";
GRANT ALL ON TABLE "public"."form_templates" TO "authenticated";
GRANT ALL ON TABLE "public"."form_templates" TO "service_role";



GRANT ALL ON TABLE "public"."gallery_categories" TO "anon";
GRANT ALL ON TABLE "public"."gallery_categories" TO "authenticated";
GRANT ALL ON TABLE "public"."gallery_categories" TO "service_role";



GRANT ALL ON TABLE "public"."gallery_items" TO "anon";
GRANT ALL ON TABLE "public"."gallery_items" TO "authenticated";
GRANT ALL ON TABLE "public"."gallery_items" TO "service_role";



GRANT ALL ON TABLE "public"."inquiries" TO "anon";
GRANT ALL ON TABLE "public"."inquiries" TO "authenticated";
GRANT ALL ON TABLE "public"."inquiries" TO "service_role";



GRANT ALL ON TABLE "public"."inquiry_attachments" TO "anon";
GRANT ALL ON TABLE "public"."inquiry_attachments" TO "authenticated";
GRANT ALL ON TABLE "public"."inquiry_attachments" TO "service_role";



GRANT ALL ON TABLE "public"."inquiry_responses" TO "anon";
GRANT ALL ON TABLE "public"."inquiry_responses" TO "authenticated";
GRANT ALL ON TABLE "public"."inquiry_responses" TO "service_role";



GRANT ALL ON TABLE "public"."inquiry_templates" TO "anon";
GRANT ALL ON TABLE "public"."inquiry_templates" TO "authenticated";
GRANT ALL ON TABLE "public"."inquiry_templates" TO "service_role";



GRANT ALL ON TABLE "public"."notifications" TO "anon";
GRANT ALL ON TABLE "public"."notifications" TO "authenticated";
GRANT ALL ON TABLE "public"."notifications" TO "service_role";



GRANT ALL ON TABLE "public"."reservations" TO "anon";
GRANT ALL ON TABLE "public"."reservations" TO "authenticated";
GRANT ALL ON TABLE "public"."reservations" TO "service_role";



GRANT ALL ON TABLE "public"."session_transactions" TO "anon";
GRANT ALL ON TABLE "public"."session_transactions" TO "authenticated";
GRANT ALL ON TABLE "public"."session_transactions" TO "service_role";



GRANT ALL ON TABLE "public"."testimonials" TO "anon";
GRANT ALL ON TABLE "public"."testimonials" TO "authenticated";
GRANT ALL ON TABLE "public"."testimonials" TO "service_role";



GRANT ALL ON TABLE "public"."user_profiles" TO "anon";
GRANT ALL ON TABLE "public"."user_profiles" TO "authenticated";
GRANT ALL ON TABLE "public"."user_profiles" TO "service_role";



GRANT ALL ON TABLE "public"."user_sessions" TO "anon";
GRANT ALL ON TABLE "public"."user_sessions" TO "authenticated";
GRANT ALL ON TABLE "public"."user_sessions" TO "service_role";









ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON SEQUENCES  TO "postgres";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON SEQUENCES  TO "anon";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON SEQUENCES  TO "authenticated";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON SEQUENCES  TO "service_role";






ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON FUNCTIONS  TO "postgres";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON FUNCTIONS  TO "anon";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON FUNCTIONS  TO "authenticated";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON FUNCTIONS  TO "service_role";






ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON TABLES  TO "postgres";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON TABLES  TO "anon";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON TABLES  TO "authenticated";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON TABLES  TO "service_role";






























RESET ALL;
