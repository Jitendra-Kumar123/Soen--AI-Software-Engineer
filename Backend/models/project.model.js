import mongoose from "mongoose"

const projectSchema = mongoose.Schema({
    
    name: {
        type: String,
        lowercase: true,
        required: true,
        trim: true
    },
    users: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true
    }],
    fileTree: {
        type: Object,
        default: {}
    }
}, { timestamps: true })

projectSchema.index({ name: 1 }, { unique: true });

const Project = mongoose.model("Project", projectSchema)


Project.collection.dropIndex('name_1_users_1', (err, result) => {
    if (err) {
        console.log('Index does not exist or error dropping:', err);
    } else {
        console.log('Dropped index name_1_users_1');
    }
});

export default Project