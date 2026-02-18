import connection from '../config/dbConfig.js'
import { DataTypes } from 'sequelize'

const Roles = connection.define('Roles', {
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
    description: {
        type: DataTypes.TEXT,
        allowNull: true
    }
},
{
    freezeTableName: true,
    timestamps: true,
}
);

export default Roles