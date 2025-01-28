-- 組織マスタの作成
INSERT INTO nippo_organizations (
    id,
    name
) VALUES (
    '00000000-0000-0000-0000-000000000000',  -- ダミーUUIDに変更
    'サンプル株式会社'
);


-- 組織の役職を作成
INSERT INTO nippo_roles (
    id,
    organization_id,
    name,
    role_level
) VALUES 
(
    '7a1b2c3d-e4f5-4a1b-8c2d-3e4f5a6b7c88',
    '00000000-0000-0000-0000-000000000000',  -- ダミーUUIDに変更
    '代表取締役社長',
    2
),
(
    '8b2c3d4e-f5a6-4b2c-9d3e-4f5a6b7c8d0e',
    '00000000-0000-0000-0000-000000000000',  -- ダミーUUIDに変更
    '事業部長',
    1
),
(
    '9d3d4e5f-a6b7-4c3d-ae4f-5a6b7c8d9e0f',
    '00000000-0000-0000-0000-000000000000',  -- ダミーUUIDに変更
    '一般社員',
    0
);

-- 社長を作成
INSERT INTO nippo_profiles (
    id,
    email,
    name,
    is_admin,
    is_superuser,
    organization_id,
    parent_id,
    role_id
) VALUES (
    '00000000-0000-0000-0000-000000000000',  -- ダミーUUIDに変更
    'yamada@example.com',
    '山田太郎',
    true,
    true,
    '00000000-0000-0000-0000-000000000000',  -- ダミーUUIDに変更
    null,
    '7a1b2c3d-e4f5-4a1b-8c2d-3e4f5a6b7c88'
);

-- 部長を作成
INSERT INTO nippo_profiles (
    id,
    email,
    name,
    is_admin,
    is_superuser,
    organization_id,
    parent_id,
    role_id
) VALUES (
    '00000000-0000-0000-0000-000000000000',  -- ダミーUUIDに変更
    'suzuki@example.com',
    '鈴木一郎',
    true,
    false,
    '00000000-0000-0000-0000-000000000000',  -- ダミーUUIDに変更
    '00000000-0000-0000-0000-000000000000',  -- ダミーUUIDに変更
    '8b2c3d4e-f5a6-4b2c-9d3e-4f5a6b7c80e'
);

-- 一般社員を作成
INSERT INTO nippo_profiles (
    id,
    email,
    name,
    is_admin,
    is_superuser,
    organization_id,
    parent_id,
    role_id
) VALUES (
    '00000000-0000-0000-0000-000000000000',  -- ダミーUUIDに変更
    'sato@example.com',
    '佐藤花子',
    false,
    false,
    '00000000-0000-0000-0000-000000000000',  -- ダミーUUIDに変更
    '00000000-0000-0000-0000-000000000000',  -- ダミーUUIDに変更
    '9d3d4e5f-a6b7-4c3d-ae4f-5a6b7c8d9e0f'
);

-- フォーマットを作成
INSERT INTO nippo_report_formats (
    id,
    user_id,
    name,
    content
) VALUES (
    'a1d2e3f4-b5c6-4d7e-8f9a-0b1c2d3e4f5a',
    '00000000-0000-0000-0000-000000000000',  -- ダミーUUIDに変更
    '基本フォーマット',
    '## 本日の業務内容\n\n## 進捗状況\n\n## 明日の予定\n\n## 気づき・学び'
);

-- フォルダを作成
INSERT INTO nippo_purposes (
    id,
    user_id,
    format_id,
    name,
    description
) VALUES (
    'b2e3f4a5-c6d7-4e8f-9a0b-1c2d3e4f5a6b',
    '00000000-0000-0000-0000-000000000000',  -- ダミーUUIDに変更
    'a1d2e3f4-b5c6-4d7e-8f9a-0b1c2d3e4f5a',
    'プロジェクトA',
    'プロジェクトAに関する日報をまとめるフォルダです'
);

-- 日報を作成
INSERT INTO nippo_reports (
    id,
    user_id,
    purpose_id,
    title,
    content,
    report_date
) VALUES (
    'c3f4a5b6-d7e8-4f9a-0b1c-2d3e4f5a6b7c',
    '00000000-0000-0000-0000-000000000000',  -- ダミーUUIDに変更
    'b2e3f4a5-c6d7-4e8f-9a0b-1c2d3e4f5a6b',
    'プロジェクトA キックオフ',
    '## 本日の業務内容\nプロジェクトAのキックオフミーティングに参加しました。\n\n## 進捗状況\n計画通り進んでいます。\n\n## 明日の予定\n要件定義を開始します。\n\n## 気づき・学び\nチーム内のコミュニケーションが重要だと感じました。',
    CURRENT_DATE
);

-- images テーブルへのデータ挿入
INSERT INTO nippo_images (id, report_id, file_path, ocr_result, created_at)
VALUES 
(
    'd4a5b6c7-e8f9-4a0b-1c2d-3e4f5a6b7c8d',
    'c3f4a5b6-d7e8-4f9a-0b1c-2d3e4f5a6b7c',
    '/uploads/images/report1.png',
    '図表Aの説明',
    '2024-03-20 10:00:00'
);