-- Private server metadata; no Data API access is granted.
alter table lew.projects add column if not exists favorite boolean not null default false;
alter table lew.projects add column if not exists last_opened timestamptz;
