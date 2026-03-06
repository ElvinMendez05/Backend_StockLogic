import connection from '../config/dbConfig.js'
import { DataTypes } from 'sequelize'

const Roles = connection.define('Roles', {
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
        allowNull: true
    },
    code: {
        type: DataTypes.TEXT,
        allowNull: false,
        unique: true
    }
},
{
    freezeTableName: true,
    timestamps: true,
}
);

export default Roles