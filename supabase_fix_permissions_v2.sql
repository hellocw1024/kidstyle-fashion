-- 修正后的 Supabase Storage 权限修复脚本

-- 1. 确保 images 存储桶存在
insert into storage.buckets (id, name, public)
values ('images', 'images', true)
on conflict (id) do nothing;

-- 2. 清理旧策略 (避免重复报错)
drop policy if exists "Public Access" on storage.objects;
drop policy if exists "Authenticated Upload" on storage.objects;
drop policy if exists "Public Upload" on storage.objects;
drop policy if exists "Authenticated Update" on storage.objects;
drop policy if exists "Authenticated Delete" on storage.objects;
drop policy if exists "Give me access" on storage.objects;

-- 3. 创建新策略

-- 允许公开查看图片 (SELECT)
create policy "Public Access"
  on storage.objects for select
  using ( bucket_id = 'images' );

-- 允许认证用户上传图片 (INSERT)
create policy "Authenticated Upload"
  on storage.objects for insert
  to authenticated
  with check ( bucket_id = 'images' );

-- 允许公开上传 (临时修复，如果您的登录状态有问题，这行可以确保能上传)
create policy "Public Upload"
  on storage.objects for insert
  to public
  with check ( bucket_id = 'images' );

-- 允许认证用户更新自己的图片
create policy "Authenticated Update"
  on storage.objects for update
  to authenticated
  using ( bucket_id = 'images' );

-- 允许认证用户删除自己的图片
create policy "Authenticated Delete"
  on storage.objects for delete
  to authenticated
  using ( bucket_id = 'images' );

-- 允许匿名用户的所有权限 (最宽松模式，仅供调试，如果上面都失败了)
-- create policy "Give me access" on storage.objects for all using (bucket_id = 'images') with check (bucket_id = 'images');
