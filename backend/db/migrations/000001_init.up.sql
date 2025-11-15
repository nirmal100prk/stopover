-- tbl_mst_address definition
-- Drop table
-- DROP TABLE tbl_mst_address;
CREATE TABLE if not EXISTS tbl_mst_address (
  address_id serial4 NOT NULL,
  city_id int4 NOT NULL,
  house_number varchar(100) NULL,
  street_name varchar(250) NULL,
  postal_code int4 NULL,
  is_active bool DEFAULT true NULL,
  CONSTRAINT tbl_mst_address_pkey PRIMARY KEY (address_id),
  CONSTRAINT uk_city_house_number_active_key UNIQUE (city_id, house_number, is_active),
  CONSTRAINT fk_city_id FOREIGN KEY (city_id) REFERENCES tbl_mst_nui_city (city_id)
);

-- tbl_mst_nui_access definition
-- Drop table
-- DROP TABLE tbl_mst_nui_access;
CREATE table if not EXISTS tbl_mst_nui_access (
  access_id int4 NOT NULL,
  access_name varchar(10) NULL,
  CONSTRAINT tbl_mst_nui_access_pkey PRIMARY KEY (access_id)
);

-- tbl_mst_nui_city definition
-- Drop table
-- DROP TABLE tbl_mst_nui_city;
CREATE table if not EXISTS tbl_mst_nui_city (
  city_id int4 NOT NULL,
  state_id int4 NOT NULL,
  "name" varchar(50) NOT NULL,
  CONSTRAINT tbl_mst_nui_city_name_key UNIQUE (name),
  CONSTRAINT tbl_mst_nui_city_pkey PRIMARY KEY (city_id),
  constraint fk_state_id FOREIGN KEY (state_id) REFERENCES tbl_mst_nui_state (state_id)
);

-- tbl_mst_nui_country definition
-- Drop table
-- DROP TABLE tbl_mst_nui_country;
CREATE table if not EXISTS tbl_mst_nui_country (
  country_id int4 NOT NULL,
  "name" varchar(50) NOT NULL,
  CONSTRAINT tbl_mst_nui_country_name_key UNIQUE (name),
  CONSTRAINT tbl_mst_nui_country_pkey PRIMARY KEY (country_id)
);

-- tbl_mst_nui_listing_category definition
-- Drop table
-- DROP TABLE tbl_mst_nui_listing_category;
CREATE table if not EXISTS tbl_mst_nui_listing_category (
  listing_category_id int4 NOT NULL,
  "name" varchar(50) NOT NULL,
  CONSTRAINT tbl_mst_nui_listing_category_name_key UNIQUE (name),
  CONSTRAINT tbl_mst_nui_listing_category_pkey PRIMARY KEY (listing_category_id)
);

-- tbl_mst_nui_property_status definition
-- Drop table
-- DROP TABLE tbl_mst_nui_property_status;
CREATE TABLE if not exists tbl_mst_nui_property_status (
  property_status_id int4 NOT NULL,
  "name" varchar(50) NOT NULL,
  CONSTRAINT tbl_mst_nui_property_status_name_key UNIQUE (name),
  CONSTRAINT tbl_mst_nui_property_status_pkey PRIMARY KEY (property_status_id)
);

-- tbl_mst_nui_property_type definition
-- Drop table
-- DROP TABLE tbl_mst_nui_property_type;
CREATE TABLE if not exists tbl_mst_nui_property_type (
  property_type_id int4 NOT NULL,
  "name" varchar(50) NOT NULL,
  CONSTRAINT tbl_mst_nui_property_type_name_key UNIQUE (name),
  CONSTRAINT tbl_mst_nui_property_type_pkey PRIMARY KEY (property_type_id)
);

-- tbl_mst_nui_resource definition
-- Drop table
-- DROP TABLE tbl_mst_nui_resource;
CREATE table if not exists tbl_mst_nui_resource (
  resource_id int4 NOT NULL,
  resource_name varchar(10) NULL,
  CONSTRAINT tbl_mst_nui_resource_pkey PRIMARY KEY (resource_id)
);

-- tbl_mst_nui_resource_access definition
-- Drop table
-- DROP TABLE tbl_mst_nui_resource_access;
CREATE table if not exists tbl_mst_nui_resource_access (
  resource_access_id int4 DEFAULT nextval(
    'tbl_mst_resource_access_resource_access_id_seq'::regclass
  ) NOT NULL,
  resource_id int4 NOT NULL,
  access_id int4 NOT NULL,
  CONSTRAINT tbl_mst_resource_access_pkey PRIMARY KEY (resource_access_id),
  constraint fk_access FOREIGN KEY (access_id) REFERENCES tbl_mst_nui_access (access_id),
  constraint fk_resource FOREIGN KEY (resource_id) REFERENCES tbl_mst_nui_resource (resource_id)
);

-- tbl_mst_nui_role definition
-- Drop table
-- DROP TABLE tbl_mst_nui_role;
CREATE table if not exists tbl_mst_nui_role (
  role_id int4 NOT NULL,
  "name" varchar(50) NOT NULL,
  CONSTRAINT tbl_mst_nui_user_role_name_key UNIQUE (name),
  CONSTRAINT tbl_mst_nui_user_role_pkey PRIMARY KEY (role_id)
);

-- tbl_mst_nui_role_access definition
-- Drop table
-- DROP TABLE tbl_mst_nui_role_access;
CREATE TABLE if not exists tbl_mst_nui_role_access (
  role_access_id int4 DEFAULT nextval(
    'tbl_mst_role_access_role_access_id_seq'::regclass
  ) NOT NULL,
  role_id int4 NOT NULL,
  resource_access_id int4 NOT NULL,
  CONSTRAINT tbl_mst_role_access_pkey PRIMARY KEY (role_access_id),
  CONSTRAINT fk_resource_access FOREIGN KEY (resource_access_id) REFERENCES tbl_mst_nui_resource_access (resource_access_id),
  CONSTRAINT fk_role FOREIGN KEY (role_id) REFERENCES tbl_mst_nui_role (role_id)
);

-- tbl_mst_nui_role_access foreign keys
-- tbl_mst_nui_state definition
-- Drop table
-- DROP TABLE tbl_mst_nui_state;
CREATE TABLE if not exists tbl_mst_nui_state (
  state_id int4 NOT NULL,
  country_id int4 NOT NULL,
  "name" varchar(50) NOT NULL,
  CONSTRAINT tbl_mst_nui_state_name_key UNIQUE (name),
  CONSTRAINT tbl_mst_nui_state_pkey PRIMARY KEY (state_id),
  CONSTRAINT fk_country_id FOREIGN KEY (country_id) REFERENCES tbl_mst_nui_country (country_id)
);

-- tbl_mst_property definition
-- Drop table
-- DROP TABLE tbl_mst_property;
CREATE TABLE if not exists tbl_mst_property (
  property_id serial4 NOT NULL,
  description varchar(50) NULL,
  property_type_id int4 NOT NULL,
  address_id int4 NOT NULL,
  owner_id int4 NOT NULL,
  price int4 NOT NULL,
  "size" int4 NULL,
  is_active bool DEFAULT true NULL,
  created_at timestamp DEFAULT now() NULL,
  updated_at timestamp NULL,
  property_status_id int4 DEFAULT 1 NOT NULL,
  CONSTRAINT tbl_mst_property_pkey PRIMARY KEY (property_id),
  constraint fk_address_id FOREIGN KEY (address_id) REFERENCES tbl_mst_address (address_id),
  constraint fk_owner_id FOREIGN KEY (owner_id) REFERENCES tbl_mst_user (user_id),
  constraint fk_property_type_id FOREIGN KEY (property_type_id) REFERENCES tbl_mst_nui_property_type (property_type_id),
  constraint fk_status FOREIGN KEY (property_status_id) REFERENCES tbl_mst_nui_property_status (property_status_id)
);

-- tbl_mst_property foreign keys
-- tbl_mst_user definition
-- Drop table
-- DROP TABLE tbl_mst_user;
CREATE TABLE if not exists tbl_mst_user (
  user_id serial4 NOT NULL,
  "name" varchar(50) NOT NULL,
  email varchar(100) NOT NULL,
  hashed_password text NOT NULL,
  role_id int4 NOT NULL,
  is_active bool DEFAULT true NULL,
  created_at timestamp DEFAULT now() NULL,
  updated_at timestamp DEFAULT now() NULL,
  login_failed_count int4 DEFAULT 0 NULL,
  is_blocked bool DEFAULT false NULL,
  CONSTRAINT tbl_mst_user_pkey PRIMARY KEY (user_id),
  CONSTRAINT uk_email_active_key UNIQUE (email, is_active),
  CONSTRAINT fk_role FOREIGN KEY (role_id) REFERENCES tbl_mst_nui_role (role_id)
);

-- tbl_mst_user foreign keys
-- tbl_mst_user_ledger definition
-- Drop table
-- DROP TABLE tbl_mst_user_ledger;
CREATE table if not exists tbl_mst_user_ledger (
  ledger_id serial4 NOT NULL,
  user_id int4 NOT NULL,
  logged_in_time timestamp DEFAULT now() NULL,
  logged_out_time timestamp DEFAULT now() NULL,
  CONSTRAINT tbl_mst_user_ledger_pkey PRIMARY KEY (ledger_id),
  constraint fk_user_id FOREIGN KEY (user_id) REFERENCES tbl_mst_user (user_id)
);

-- tbl_mst_user_ledger foreign keys
-- tbl_mst_user_role definition
-- Drop table
-- DROP TABLE tbl_mst_user_role;
CREATE table if not exists tbl_mst_user_role (
  user_role_id serial4 NOT NULL,
  role_id int4 NOT NULL,
  is_active bool DEFAULT true NULL,
  user_id int4 NOT NULL,
  CONSTRAINT tbl_mst_user_role_pkey PRIMARY KEY (user_role_id),
  constraint fk_role FOREIGN KEY (role_id) REFERENCES tbl_mst_nui_role (role_id),
  constraint fk_user FOREIGN KEY (user_id) REFERENCES tbl_mst_user (user_id)
);


