'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    // Es mejor usar bulkInsert para asegurar que los roles existan
    return queryInterface.bulkInsert('Roles', [
      {
        name: 'SUPER_ADMIN',
        description: 'Dueño de la empresa, tiene control total sobre empleados e inventario.',
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        name: 'ADMIN',
        description: 'Administrador designado por el dueño para gestionar el día a día.',
        createdAt: new Date(),
        updatedAt: new Date()
      },
    ], {});
  },

  async down (queryInterface, Sequelize) {
    // Esto borra los roles si decides revertir el seeder
    return queryInterface.bulkDelete('Roles', null, {});
  }
};