alter table links
  add column if not exists summary_source text not null default 'rules';
