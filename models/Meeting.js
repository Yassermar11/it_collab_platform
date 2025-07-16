module.exports = (sequelize, DataTypes) => {
    const Meeting = sequelize.define('meetings', {
        title: {
            type: DataTypes.STRING,
            allowNull: false
        },
        description: {
            type: DataTypes.TEXT
        },
        start_time: {
            type: DataTypes.DATE,
            allowNull: false
        },
        end_time: {
            type: DataTypes.DATE,
            allowNull: false
        },
        computed_status: {
            type: DataTypes.ENUM('scheduled', 'in_progress', 'completed', 'cancelled'),
            defaultValue: 'scheduled'
        },
        creator_id: {
            type: DataTypes.INTEGER,
            allowNull: false
        },
        invited_users: {
            type: DataTypes.TEXT,
            allowNull: false,
            defaultValue: '[]'
        },
        link: {
            type: DataTypes.STRING,
            allowNull: true
        }
    }, {
        timestamps: true,
        tableName: 'meetings',
        createdAt: 'created_at',
        updatedAt: 'updated_at'
    });

    Meeting.associate = function(models) {
        Meeting.belongsTo(models.User, {
            as: 'creator',
            foreignKey: 'creator_id'
        });
    };

    return Meeting;
};