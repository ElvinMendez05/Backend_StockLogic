import RolesModel from '../rolesModel.js'

const seedDefaultRoles = async (RolesModel) => {
    const count = await RolesModel.count();
    if (count === 0) {
        await RolesModel.bulkCreate([
            { name: 'SUPER_ADMIN', description: 'Company owner. It has total control', code: 'SUPER_ADMIN' },
            { name: 'ADMIN', description: 'Administrator. Total control over lower tier users', code: 'ADMIN' },
            { name: 'SELLER', description: 'Seller. Controls the sales module.', code: 'SELLER' },
            { name: 'WAREHOUSEMAN', description: 'Warehouseman. Controls the providers module.', code: 'WAREHOUSEMAN' },
            { name: 'AUDITOR', description: 'Auditor. Controls the reports module and has read only permissions.', code: 'AUDITOR' },
        ]);
        console.log("Default roles created.");
    }
};

export default seedDefaultRoles