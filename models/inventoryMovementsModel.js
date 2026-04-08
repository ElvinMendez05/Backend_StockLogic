import connection from '../config/dbConfig.js'
import { DataTypes } from 'sequelize'

const InventoryMovements = connection.define('InventoryMovements', {
    id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
        allowNull: false
    },
    movementType: {
        type: DataTypes.ENUM('IN', 'OUT', 'ADJUSTMENT'),
        allowNull: false  
    },
    quantity: {
        type: DataTypes.INTEGER,
        allowNull: false
    },
    costPriceAtMovement: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: false
    },
    previousStock: {
        type: DataTypes.INTEGER,
        allowNull: false
    },
    newStock: {
        type: DataTypes.INTEGER,
        allowNull: false
    },
    reference: {
        type: DataTypes.TEXT,
        allowNull: false
    },
    saleId: {
        type: DataTypes.UUID,
        allowNull: true,
        References: {
            model: "Sales",
            key: "id"
        },
        onUpdate: "CASCADE"
    },
    providerId: {
        type: DataTypes.UUID,
        allowNull: true,
        References: {
            model: "Products",
            key: "id"
        },
        onUpdate: "CASCADE"
    },
    productId: {
        type: DataTypes.UUID,
        allowNull: false,
        References: {
            model: "Products",
            key: "id"
        },
        onUpdate: "CASCADE"
    },
    userId: {
        type: DataTypes.UUID,
        allowNull: false,
        References: {
            model: "Users",
            key: "id"
        },
        onUpdate: "CASCADE"
    },
    companyId: {
        type: DataTypes.UUID,
        allowNull: false,
        References: {
            model: "Companies",
            key: "id"
        },
        onDelete: "CASCADE",
        onUpdate: "CASCADE"
    }
},
{
    freezeTableName: true,
    timestamps: true,
}
);

export default InventoryMovements