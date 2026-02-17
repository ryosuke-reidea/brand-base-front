/*
  # idea_products テーブルの RLS ポリシー設定

  ## 概要
  管理画面で登録・公開されたアイデア商品を、
  フロント LP から anon ロールで読み取れるようにする。

  ## ポリシー
  - anon / authenticated は published ステータスのみ SELECT 可
  - authenticated は INSERT / UPDATE / DELETE 可（管理画面用）
*/

-- RLS が無効な場合に備えて有効化
ALTER TABLE idea_products ENABLE ROW LEVEL SECURITY;

-- 既存ポリシーを安全にドロップ
DROP POLICY IF EXISTS "Anyone can view published idea_products" ON idea_products;
DROP POLICY IF EXISTS "Authenticated users can insert idea_products" ON idea_products;
DROP POLICY IF EXISTS "Authenticated users can update idea_products" ON idea_products;
DROP POLICY IF EXISTS "Authenticated users can delete idea_products" ON idea_products;

-- 公開済みのアイデアのみ誰でも閲覧可能
CREATE POLICY "Anyone can view published idea_products"
  ON idea_products
  FOR SELECT
  TO anon, authenticated
  USING (status = 'published');

-- 管理画面からの登録
CREATE POLICY "Authenticated users can insert idea_products"
  ON idea_products
  FOR INSERT
  TO authenticated
  WITH CHECK (true);

-- 管理画面からの更新（公開/非公開切り替え等）
CREATE POLICY "Authenticated users can update idea_products"
  ON idea_products
  FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- 管理画面からの削除
CREATE POLICY "Authenticated users can delete idea_products"
  ON idea_products
  FOR DELETE
  TO authenticated
  USING (true);
