import RolesModel from '../rolesModel.js'

const seedDefaultRoles = async (RolesModel) => {
    const count = await RolesModel.count();
    if (count === 0) {
        await RolesModel.bulkCreate([
            { name: 'SUPER_ADMIN', description: 'Dueño de la empresa' },
            { name: 'ADMIN', description: 'Administrador' },
            { name: 'EMPLOYEE', description: 'Empleado' }
        ]);
        console.log("Default roles created.");
    }
};

export default seedDefaultRoles