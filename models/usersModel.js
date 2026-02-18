import connection from '../config/dbConfig.js'
import { DataTypes } from 'sequelize'

const Users = connection.define('Users', {
    id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
        allowNull: false
    },
    name: {
        type: DataTypes.STRING,
        allowNull: false
    },
    email: {
        type: DataTypes.STRING,
        allowNull: false
    },
    password: {
        type: DataTypes.STRING,
        allowNull: false
    },
    activateToken: {
        type: DataTypes.STRING,
        allowNull: true
    },
    activateTokenExpiration: {
        type: DataTypes.DATE,
        allowNull: true
    },
    resetToken: {
        type: DataTypes.STRING,
        allowNull: true,
    },
    resetTokenExpiration: {
        type: DataTypes.DATE,
        allowNull: true,
    },
    isActive: {
        type: DataTypes.BOOLEAN,
        defaultValue: false,
        allowNull: true,
    },
    companyId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        References: {
            model: "Companies",
            key: "id"
        },
        onDelete: "CASCADE",
        onUpdate: "CASCADE"
    },
    roleId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        References: {
            model: "Roles",
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

export default Users