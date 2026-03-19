import connection from '../config/dbConfig.js'
import { DataTypes } from 'sequelize'

const Products = connection.define('Products', {
    id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
        allowNull: false
    },
    name: {
        type: DataTypes.STRING,
        allowNull: false
    },
    sku: {
        type: DataTypes.STRING,
        allowNull: true,
        unique: true 
    },
    description: {
        type: DataTypes.TEXT,
        allowNull: false
    },
    imageURL: {
        type: DataTypes.STRING,
        allowNull: false
    },
    price: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: false
    },
    costPrice: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: false
    },
    currentStock: {
        type: DataTypes.INTEGER,
        allowNull: false
    },
    minStock: {
        type: DataTypes.INTEGER,
        allowNull: false
    },
    maxStock: {
        type: DataTypes.INTEGER,
        allowNull: false
    },
    categoryId: {
        type: DataTypes.UUID,
        allowNull: false,
        References: {
            model: "Categories",
            key: "id"
        },
        onDelete: "CASCADE",
        onUpdate: "CASCADE"
    },
    providerId: {
        type: DataTypes.UUID,
        allowNull: false,
        References: {
            model: "Providers",
            key: "id"
        },
        onDelete: "CASCADE",
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
    },
},
{
    freezeTableName: true,
    timestamps: true,
}
);

export default Products