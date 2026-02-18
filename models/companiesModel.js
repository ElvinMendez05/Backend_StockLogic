import { timeStamp } from 'console';
import connection from '../config/dbConfig.js'
import { DataTypes } from 'sequelize'

const Companies = connection.define('Companies', {
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
    }
},
{
    freezeTableName: true,
    timestamps: true,
}
);

export default Companies