const { createClient } = require('@supabase/supabase-js');

const SUPABASE_URL = "https://cqjskmeodznouiixdrok.supabase.co";
const SUPABASE_KEY = "sb_publishable_K26cSK7CSEV61FS56ea8mw_eUN7O92F";
const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

const modelsToRegister = [
    { name: '晨晨', ageGroup: '0-1岁', gender: '男', ethnicity: '亚裔', url: '/models/chenchen_3yo.png' },
    { name: '小博', ageGroup: '0-1岁', gender: '男', ethnicity: '亚裔', url: '/models/xiaobo_3yo.png' },
    { name: '阳阳', ageGroup: '3-6岁', gender: '男', ethnicity: '亚裔', url: '/models/yangyang_4yo.png' },
    { name: '涵涵', ageGroup: '3-6岁', gender: '男', ethnicity: '亚裔', url: '/models/hanhan_5yo.png' },
    { name: '轩轩', ageGroup: '3-6岁', gender: '男', ethnicity: '亚裔', url: '/models/xuanxuan_5yo.png' }
];

async function register() {
    for (const model of modelsToRegister) {
        const { error: dbError } = await supabase
            .from('models')
            .insert([{
                id: `model_batch1_${Date.now()}_${Math.random().toString(36).substr(2, 3)}`,
                url: model.url,
                gender: model.gender,
                age_group: model.ageGroup,
                ethnicity: model.ethnicity,
                name: model.name,
                uploaded_by: 'SYSTEM',
                status: 'ACTIVE'
            }]);

        if (dbError) {
            console.error(`Error registering ${model.name}:`, dbError.message);
        } else {
            console.log(`Successfully registered ${model.name}.`);
        }
    }
}

register();
