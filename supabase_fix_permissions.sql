-- Enable the storage extension if not already enabled
create extension if not exists "storage" schema "extensions";

-- 创建 images 存储桶（如果不存在）
insert into storage.buckets (id, name, public)
values ('images', 'images', true)
on conflict (id) do nothing;

-- 允许公开访问 images 存储桶（SELECT）
create policy "Public Access"
  on storage.objects for select
  using ( bucket_id = 'images' );

-- 允许认证用户上传图片 (INSERT)
-- 如果是在开发环境且没有强制认证，可以暂时改为 allow all, 但建议至少要求 authenticated
create policy "Authenticated Upload"
  on storage.objects for insert
  to authenticated
  with check ( bucket_id = 'images' );

-- 允许任何人上传（仅用于开发调试，如果上面的 authenticated 不起作用）
create policy "Public Upload"
  on storage.objects for insert
  to public
  with check ( bucket_id = 'images' );

-- 允许用户更新/删除自己的图片 (UPDATE/DELETE)
-- 这里简单处理，允许 authenticated 用户操作，生产环境建议配合 owner使用
create policy "Authenticated Update"
  on storage.objects for update
  to authenticated
  using ( bucket_id = 'images' );

create policy "Authenticated Delete"
  on storage.objects for delete
  to authenticated
  using ( bucket_id = 'images' );
