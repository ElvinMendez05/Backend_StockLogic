import connection from '../config/dbConfig.js'
import { DataTypes } from 'sequelize'

const Sales = connection.define('Sales', {
    id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
        allowNull: false
    },
    clientName: {
        type: DataTypes.STRING,
        allowNull: false
    },
    code: {
        type: DataTypes.STRING,
        allowNull: true,
        unique: true 
    },
    quantity: {
        type: DataTypes.INTEGER,
        allowNull: false
    },
    totalPrice: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: false
    },
    paymentMethod: {
        type: DataTypes.ENUM('CASH', 'CREDIT CARD', 'TRANSFER', 'DEBIT CARD'),
        allowNull: false
    },
    registerDate:{
        type: DataTypes.DATE,
        allowNull: false      
    },
    isCompleted:{
        type: DataTypes.BOOLEAN,
        allowNull: false        
    },
    completedAt:{
        type: DataTypes.DATE,
        allowNull: true 
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

export default Sales