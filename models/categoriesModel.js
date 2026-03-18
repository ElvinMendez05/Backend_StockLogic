import connection from '../config/dbConfig.js'
import { DataTypes } from 'sequelize'

const Categories = connection.define('Categories', {
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
    description: {
        type: DataTypes.TEXT,
        allowNull: false
    },
    isActive: {
        type: DataTypes.BOOLEAN,
        defaultValue: false,
        allowNull: false,
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

export default Categories