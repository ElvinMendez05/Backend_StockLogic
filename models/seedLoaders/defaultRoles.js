import RolesModel from '../rolesModel.js'

const seedDefaultRoles = async (RolesModel) => {
    const count = await RolesModel.count();
    if (count === 0) {
        await RolesModel.bulkCreate([
            { name: 'SUPER_ADMIN', description: 'Company owner', code: 'SUPER_ADMIN' },
            { name: 'ADMIN', description: 'Administrator', code: 'ADMIN' },
            { name: 'EMPLOYEE', description: 'Employee', code: 'EMPLOYEE' }
        ]);
        console.log("Default roles created.");
    }
};

export default seedDefaultRoles