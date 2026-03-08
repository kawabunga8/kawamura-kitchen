


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


COMMENT ON SCHEMA "public" IS 'standard public schema';



CREATE EXTENSION IF NOT EXISTS "pg_graphql" WITH SCHEMA "graphql";






CREATE EXTENSION IF NOT EXISTS "pg_stat_statements" WITH SCHEMA "extensions";






CREATE EXTENSION IF NOT EXISTS "pgcrypto" WITH SCHEMA "extensions";






CREATE EXTENSION IF NOT EXISTS "supabase_vault" WITH SCHEMA "vault";






CREATE EXTENSION IF NOT EXISTS "uuid-ossp" WITH SCHEMA "extensions";





SET default_tablespace = '';

SET default_table_access_method = "heap";


CREATE TABLE IF NOT EXISTS "public"."classes" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "name" "text" NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL
);


ALTER TABLE "public"."classes" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."dinners" (
    "id" bigint NOT NULL,
    "date" "date" NOT NULL,
    "meal" "text" NOT NULL,
    "chef" "text" NOT NULL,
    "time" "text" NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"(),
    "notes" "text" DEFAULT ''::"text"
);


ALTER TABLE "public"."dinners" OWNER TO "postgres";


CREATE SEQUENCE IF NOT EXISTS "public"."dinners_id_seq"
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE "public"."dinners_id_seq" OWNER TO "postgres";


ALTER SEQUENCE "public"."dinners_id_seq" OWNED BY "public"."dinners"."id";



CREATE TABLE IF NOT EXISTS "public"."family_members" (
    "id" bigint NOT NULL,
    "name" "text" NOT NULL,
    "email" "text" NOT NULL,
    "phone" "text",
    "preferences" "text",
    "email_notifications" boolean DEFAULT true,
    "created_at" timestamp with time zone DEFAULT "now"(),
    "color" "text" DEFAULT 'orange'::"text"
);


ALTER TABLE "public"."family_members" OWNER TO "postgres";


CREATE SEQUENCE IF NOT EXISTS "public"."family_members_id_seq"
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE "public"."family_members_id_seq" OWNER TO "postgres";


ALTER SEQUENCE "public"."family_members_id_seq" OWNED BY "public"."family_members"."id";



CREATE TABLE IF NOT EXISTS "public"."pantry_items" (
    "id" bigint NOT NULL,
    "name" "text" NOT NULL,
    "quantity" "text" NOT NULL,
    "low_stock" boolean DEFAULT false,
    "source" "text" NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"(),
    "category" "text" DEFAULT 'pantry'::"text",
    "notes" "text" DEFAULT ''::"text"
);


ALTER TABLE "public"."pantry_items" OWNER TO "postgres";


CREATE SEQUENCE IF NOT EXISTS "public"."pantry_items_id_seq"
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE "public"."pantry_items_id_seq" OWNER TO "postgres";


ALTER SEQUENCE "public"."pantry_items_id_seq" OWNED BY "public"."pantry_items"."id";



CREATE TABLE IF NOT EXISTS "public"."requests" (
    "id" bigint NOT NULL,
    "meal" "text" NOT NULL,
    "requested_by" "text" NOT NULL,
    "status" "text" DEFAULT 'pending'::"text",
    "votes" integer DEFAULT 0,
    "created_at" timestamp with time zone DEFAULT "now"()
);


ALTER TABLE "public"."requests" OWNER TO "postgres";


CREATE SEQUENCE IF NOT EXISTS "public"."requests_id_seq"
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE "public"."requests_id_seq" OWNER TO "postgres";


ALTER SEQUENCE "public"."requests_id_seq" OWNED BY "public"."requests"."id";



CREATE TABLE IF NOT EXISTS "public"."students" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "class_id" "uuid" NOT NULL,
    "full_name" "text" NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL
);


ALTER TABLE "public"."students" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."votes" (
    "id" bigint NOT NULL,
    "request_id" bigint,
    "voter_name" "text" NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"(),
    "voter_id" bigint
);


ALTER TABLE "public"."votes" OWNER TO "postgres";


CREATE SEQUENCE IF NOT EXISTS "public"."votes_id_seq"
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE "public"."votes_id_seq" OWNER TO "postgres";


ALTER SEQUENCE "public"."votes_id_seq" OWNED BY "public"."votes"."id";



ALTER TABLE ONLY "public"."dinners" ALTER COLUMN "id" SET DEFAULT "nextval"('"public"."dinners_id_seq"'::"regclass");



ALTER TABLE ONLY "public"."family_members" ALTER COLUMN "id" SET DEFAULT "nextval"('"public"."family_members_id_seq"'::"regclass");



ALTER TABLE ONLY "public"."pantry_items" ALTER COLUMN "id" SET DEFAULT "nextval"('"public"."pantry_items_id_seq"'::"regclass");



ALTER TABLE ONLY "public"."requests" ALTER COLUMN "id" SET DEFAULT "nextval"('"public"."requests_id_seq"'::"regclass");



ALTER TABLE ONLY "public"."votes" ALTER COLUMN "id" SET DEFAULT "nextval"('"public"."votes_id_seq"'::"regclass");



ALTER TABLE ONLY "public"."classes"
    ADD CONSTRAINT "classes_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."dinners"
    ADD CONSTRAINT "dinners_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."family_members"
    ADD CONSTRAINT "family_members_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."pantry_items"
    ADD CONSTRAINT "pantry_items_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."requests"
    ADD CONSTRAINT "requests_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."students"
    ADD CONSTRAINT "students_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."votes"
    ADD CONSTRAINT "votes_pkey" PRIMARY KEY ("id");



CREATE INDEX "idx_votes_request_id" ON "public"."votes" USING "btree" ("request_id");



CREATE INDEX "idx_votes_voter_id" ON "public"."votes" USING "btree" ("voter_id");



CREATE INDEX "idx_votes_voter_name" ON "public"."votes" USING "btree" ("voter_name");



CREATE INDEX "students_class_id_idx" ON "public"."students" USING "btree" ("class_id");



CREATE UNIQUE INDEX "uniq_votes_request_voter" ON "public"."votes" USING "btree" ("request_id", "voter_id");



ALTER TABLE ONLY "public"."students"
    ADD CONSTRAINT "students_class_id_fkey" FOREIGN KEY ("class_id") REFERENCES "public"."classes"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."votes"
    ADD CONSTRAINT "votes_request_id_fkey" FOREIGN KEY ("request_id") REFERENCES "public"."requests"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."votes"
    ADD CONSTRAINT "votes_voter_id_fkey" FOREIGN KEY ("voter_id") REFERENCES "public"."family_members"("id") ON DELETE CASCADE;



CREATE POLICY "Allow all access to dinners" ON "public"."dinners" USING (true);



CREATE POLICY "Allow all access to family_members" ON "public"."family_members" USING (true);



CREATE POLICY "Allow all access to pantry_items" ON "public"."pantry_items" USING (true);



CREATE POLICY "Allow all access to requests" ON "public"."requests" USING (true);



CREATE POLICY "Allow authenticated users full access to dinners" ON "public"."dinners" TO "authenticated" USING (true) WITH CHECK (true);



CREATE POLICY "Allow authenticated users full access to family_members" ON "public"."family_members" TO "authenticated" USING (true) WITH CHECK (true);



CREATE POLICY "Allow authenticated users full access to pantry_items" ON "public"."pantry_items" TO "authenticated" USING (true) WITH CHECK (true);



CREATE POLICY "Allow authenticated users full access to requests" ON "public"."requests" TO "authenticated" USING (true) WITH CHECK (true);



CREATE POLICY "Allow authenticated users full access to votes" ON "public"."votes" TO "authenticated" USING (true) WITH CHECK (true);



CREATE POLICY "Enable delete access for authenticated users" ON "public"."pantry_items" FOR DELETE TO "authenticated" USING (true);



CREATE POLICY "Enable insert access for authenticated users" ON "public"."pantry_items" FOR INSERT TO "authenticated" WITH CHECK (true);



CREATE POLICY "Enable read access for authenticated users" ON "public"."pantry_items" FOR SELECT TO "authenticated" USING (true);



CREATE POLICY "Enable update access for authenticated users" ON "public"."pantry_items" FOR UPDATE TO "authenticated" USING (true);



ALTER TABLE "public"."dinners" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."family_members" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."pantry_items" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."requests" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."votes" ENABLE ROW LEVEL SECURITY;




ALTER PUBLICATION "supabase_realtime" OWNER TO "postgres";






ALTER PUBLICATION "supabase_realtime" ADD TABLE ONLY "public"."dinners";



ALTER PUBLICATION "supabase_realtime" ADD TABLE ONLY "public"."family_members";



ALTER PUBLICATION "supabase_realtime" ADD TABLE ONLY "public"."pantry_items";



ALTER PUBLICATION "supabase_realtime" ADD TABLE ONLY "public"."requests";



ALTER PUBLICATION "supabase_realtime" ADD TABLE ONLY "public"."votes";



GRANT USAGE ON SCHEMA "public" TO "postgres";
GRANT USAGE ON SCHEMA "public" TO "anon";
GRANT USAGE ON SCHEMA "public" TO "authenticated";
GRANT USAGE ON SCHEMA "public" TO "service_role";








































































































































































GRANT ALL ON TABLE "public"."classes" TO "anon";
GRANT ALL ON TABLE "public"."classes" TO "authenticated";
GRANT ALL ON TABLE "public"."classes" TO "service_role";



GRANT ALL ON TABLE "public"."dinners" TO "anon";
GRANT ALL ON TABLE "public"."dinners" TO "authenticated";
GRANT ALL ON TABLE "public"."dinners" TO "service_role";



GRANT ALL ON SEQUENCE "public"."dinners_id_seq" TO "anon";
GRANT ALL ON SEQUENCE "public"."dinners_id_seq" TO "authenticated";
GRANT ALL ON SEQUENCE "public"."dinners_id_seq" TO "service_role";



GRANT ALL ON TABLE "public"."family_members" TO "anon";
GRANT ALL ON TABLE "public"."family_members" TO "authenticated";
GRANT ALL ON TABLE "public"."family_members" TO "service_role";



GRANT ALL ON SEQUENCE "public"."family_members_id_seq" TO "anon";
GRANT ALL ON SEQUENCE "public"."family_members_id_seq" TO "authenticated";
GRANT ALL ON SEQUENCE "public"."family_members_id_seq" TO "service_role";



GRANT ALL ON TABLE "public"."pantry_items" TO "anon";
GRANT ALL ON TABLE "public"."pantry_items" TO "authenticated";
GRANT ALL ON TABLE "public"."pantry_items" TO "service_role";



GRANT ALL ON SEQUENCE "public"."pantry_items_id_seq" TO "anon";
GRANT ALL ON SEQUENCE "public"."pantry_items_id_seq" TO "authenticated";
GRANT ALL ON SEQUENCE "public"."pantry_items_id_seq" TO "service_role";



GRANT ALL ON TABLE "public"."requests" TO "anon";
GRANT ALL ON TABLE "public"."requests" TO "authenticated";
GRANT ALL ON TABLE "public"."requests" TO "service_role";



GRANT ALL ON SEQUENCE "public"."requests_id_seq" TO "anon";
GRANT ALL ON SEQUENCE "public"."requests_id_seq" TO "authenticated";
GRANT ALL ON SEQUENCE "public"."requests_id_seq" TO "service_role";



GRANT ALL ON TABLE "public"."students" TO "anon";
GRANT ALL ON TABLE "public"."students" TO "authenticated";
GRANT ALL ON TABLE "public"."students" TO "service_role";



GRANT ALL ON TABLE "public"."votes" TO "anon";
GRANT ALL ON TABLE "public"."votes" TO "authenticated";
GRANT ALL ON TABLE "public"."votes" TO "service_role";



GRANT ALL ON SEQUENCE "public"."votes_id_seq" TO "anon";
GRANT ALL ON SEQUENCE "public"."votes_id_seq" TO "authenticated";
GRANT ALL ON SEQUENCE "public"."votes_id_seq" TO "service_role";









ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON SEQUENCES TO "postgres";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON SEQUENCES TO "anon";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON SEQUENCES TO "authenticated";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON SEQUENCES TO "service_role";






ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON FUNCTIONS TO "postgres";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON FUNCTIONS TO "anon";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON FUNCTIONS TO "authenticated";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON FUNCTIONS TO "service_role";






ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON TABLES TO "postgres";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON TABLES TO "anon";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON TABLES TO "authenticated";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON TABLES TO "service_role";































drop extension if exists "pg_net";


