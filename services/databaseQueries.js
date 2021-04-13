
let mongoose = require("mongoose");
let controller = {};

controller.findByQuery = (model, query, limit, skip, sort) => {
    try {
        let queryObj = query || {};
        let sortObj = sort || { _id: -1 };
        let limitVal = limit || 1000;
        let skipVal = skip || 0;
        return model
            .find(queryObj)
            .skip(skipVal)
            .limit(limitVal)
            .sort(sortObj)
            .select("-__v");
    } catch (error) {
        return error;
    }
};

controller.findOne = (model, query, sort) => {
    try {
        let queryObj = query || {};
        let sortObj = sort || { _id: -1 };
        return model
            .findOne(queryObj)
            .sort(sortObj)
            .select("-__v");
    } catch (error) {
        console.log(error);
    }
};

controller.createOne = (model, document) => {
    try {
        return model.create(document);
    } catch (error) {
        console.log(error);
    }
};

controller.aggregateQuery = (model, pipeline, options) => {
    try {
        return model.aggregate(pipeline, options);
    } catch (error) {
        console.log(error);
    }
};

controller.getDistinctValues = (model, query, keyName) => {
    try {
        let sortObj = {};
        sortObj[keyName] = 1;
        return model.find(query).distinct(keyName);
    } catch (error) {
        console.log(error);
    }
};

controller.findOneAndUpdate = (model, query, updateObj) => {
    try {
        return model.findOneAndUpdate(query, { $set: updateObj });
    } catch (error) {
        console.log(error);
    }
};

controller.update = (model, query, updateObj) => {
    try {
        return model.update(query, { $set: updateObj }, { multi: true });
    } catch (error) {
        console.log(error);
    }
};
controller.updateWithQuery = (model, query, updateQuery) => {
    try {
        return model.update(query, updateQuery, { multi: true });
    } catch (error) {
        console.log(error);
    }
};

controller.addOrUpdate = (model, query, updateObj) => {
    try {
        return model.update(
            query, { $set: updateObj }, { multi: true, upsert: true }
        );
    } catch (error) {
        console.log(error);
    }
};

controller.findWithSelection = (model, query, selection, limit, skip, sort) => {
    try {
        let queryObj = query || {};
        let sortObj = sort || { _id: -1 };
        let limitVal = limit || 100;
        let skipVal = skip || 0;
        selection = selection;
        return model
            .find(queryObj)
            .select(selection)
            .skip(skipVal)
            .limit(limitVal)
            .sort(sortObj);
    } catch (error) {
        console.log(error);
    }
};

controller.countDocuments = (model, query) => {
    try {
        return model.count(query);
    } catch (error) {
        console.log(error);
    }
};

controller.createMany = (model, docArray) => {
    try {
        return model.insertMany(docArray);
    } catch (error) {
        console.log(error);
    }
};

module.exports = controller;
