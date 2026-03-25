'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    // Es mejor usar bulkInsert para asegurar que los roles existan
    return queryInterface.bulkInsert('Roles', [
      {
        name: 'SUPER_ADMIN',
        description: 'Dueño de la empresa, tiene control total sobre empleados e inventario.',
        code: 'SUPER_ADMIN',
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        name: 'ADMIN',
        description: 'Administrador designado por el dueño para gestionar el día a día.',
        code: 'ADMIN',
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        name: 'SELLER',
        description: 'Vendedor encargado del módulo de ventas',
        code: 'SELLER',
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        name: 'WAREHOUSEMAN',
        description: 'Almacenista encargado del módulo de gestión de proveedores y rehabastecimiento.',
        code: 'WAREHOUSEMAN',
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        name: 'AUDITOR',
        description: 'Auditor encargado del módulo de reportes y proveedores. Solo tiene permiso de lectura.',
        code: 'AUDITOR',
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