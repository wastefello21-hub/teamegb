-- Receipt download feature flag for app settings

alter table if exists public.app_settings
  add column if not exists allow_receipt_download boolean not null default true;

update public.app_settings
set allow_receipt_download = true
where allow_receipt_download is null;
