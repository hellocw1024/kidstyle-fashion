const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

const SUPABASE_URL = "https://cqjskmeodznouiixdrok.supabase.co";
const SUPABASE_KEY = "sb_publishable_K26cSK7CSEV61FS56ea8mw_eUN7O92F"; // Using anon key, assuming storage is public
const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

const modelsToUpload = [
    {
        name: '晨晨',
        ageGroup: '0-1岁',
        gender: '男',
        ethnicity: '亚裔',
        localPath: '/Users/chenwei/.gemini/antigravity/brain/9054c7fe-2b81-4c83-8c51-5ea937480070/chinese_boy_model_chenchen_3yo_1768262107434.png'
    },
    {
        name: '小博',
        ageGroup: '0-1岁',
        gender: '男',
        ethnicity: '亚裔',
        localPath: '/Users/chenwei/.gemini/antigravity/brain/9054c7fe-2b81-4c83-8c51-5ea937480070/chinese_boy_model_xiaobo_3yo_1768262121558.png'
    },
    {
        name: '阳阳',
        ageGroup: '3-6岁',
        gender: '男',
        ethnicity: '亚裔',
        localPath: '/Users/chenwei/.gemini/antigravity/brain/9054c7fe-2b81-4c83-8c51-5ea937480070/chinese_boy_model_yangyang_4yo_1768262135598.png'
    },
    {
        name: '涵涵',
        ageGroup: '3-6岁',
        gender: '男',
        ethnicity: '亚裔',
        localPath: '/Users/chenwei/.gemini/antigravity/brain/9054c7fe-2b81-4c83-8c51-5ea937480070/chinese_boy_model_hanhan_5yo_1768262149905.png'
    },
    {
        name: '轩轩',
        ageGroup: '3-6岁',
        gender: '男',
        ethnicity: '亚裔',
        localPath: '/Users/chenwei/.gemini/antigravity/brain/9054c7fe-2b81-4c83-8c51-5ea937480070/chinese_boy_model_xuanxuan_5yo_1768262164194.png'
    }
];

async function upload() {
    for (const model of modelsToUpload) {
        const fileContent = fs.readFileSync(model.localPath);
        const fileName = `models/${Date.now()}_${path.basename(model.localPath)}`;

        console.log(`Uploading ${model.name}...`);

        const { data, error } = await supabase.storage
            .from('images')
            .upload(fileName, fileContent, {
                contentType: 'image/png'
            });

        if (error) {
            console.error(`Error uploading ${model.name}:`, error.message);
            continue;
        }

        const { data: { publicUrl } } = supabase.storage
            .from('images')
            .getPublicUrl(fileName);

        console.log(`Successfully uploaded ${model.name}. URL: ${publicUrl}`);

        const { error: dbError } = await supabase
            .from('models')
            .insert([{
                id: `model_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`,
                url: publicUrl,
                gender: model.gender,
                age_group: model.ageGroup,
                ethnicity: model.ethnicity,
                name: model.name,
                uploaded_by: 'SYSTEM',
                status: 'ACTIVE'
            }]);

        if (dbError) {
            console.error(`Error inserting ${model.name} into DB:`, dbError.message);
        } else {
            console.log(`Successfully registered ${model.name} in database.`);
        }
    }
}

upload();
