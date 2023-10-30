const path = require("path");
const mongoose = require("mongoose");
const { INTERNAL_SERVER_ERROR } = require("../constants/errorMessageConstants");
const LinkModel = require("../models/linkModel");
const LinkClickDetailModel = require("../models/linkClickDetailModel");
const CounterModel = require("../models/counterModel");
const AppError = require("../utils/errorHandling/AppError");
const Hashids = require('hashids/cjs');
const hashids = new Hashids("suresh", 2);

exports.createShortUrl = async (req, res, next) => {
    const { input_url, title, link_expire_date, unique_extension, analytics } = req.body;
    const { user } = req;
    if (analytics && !user.analytics) {
        return next(new AppError(400, "You cannot pass value of analytics as true."));
    }
    try {
        let output_url;
        if (unique_extension) {
            output_url = unique_extension;
        } else {
            const session = await mongoose.startSession();
            async function incrementCounter(session) {
                const result = await CounterModel.findOneAndUpdate(
                    { _id: "640b0195413c3fb592e232c9" },
                    { $inc: { count: 1 } },
                    { session, new: true }
                );
                return result.count;
            }

            let counterValue;
            await session.withTransaction(async () => {
                counterValue = await incrementCounter(session);
            });
            output_url = hashids.encode(counterValue);
        }

        const createdAt = new Date();
        const newUrlObj = await LinkModel.create({
            created_at: createdAt,
            created_by: user._id,
            input_url,
            output_url,
            status: true,
            title,
            link_expire_date,
            analytics
        });
        res.status(201).json({
            status: "success",
            data: {
                newUrlObj
            }
        })
    } catch (error) {
        if (error.code === 11000) {
            return next(new AppError(409, `${unique_extension} extension already taken by someone else.`));
        } else {
            return next(new AppError(500, INTERNAL_SERVER_ERROR));
        }
    }
}

exports.redirect = async (req, res, next) => {
    const { id } = req.params;
    try {
        const urlObj = await LinkModel.findOne({ output_url: id });
        urlObj.click_count++;
        urlObj.save();
        if (!urlObj) {
            return res.sendFile("urlNotFound.html", { root: path.join("./public") }, (err) => {
                if (err) {
                    next(new AppError(500, INTERNAL_SERVER_ERROR))
                }
            });
        }
        if (urlObj.status) {
            if (urlObj.link_expire_date === null || new Date(urlObj.link_expire_date) > new Date()) {
                if (urlObj.analytics) {
                    const created_at = new Date();
                    await LinkClickDetailModel.create({
                        created_at,
                        link_id: urlObj._id
                    });
                }
                return res.redirect(urlObj.input_url);
            } else {
                return res.sendFile("redirectFalseError.html", { root: path.join("./public") }, (err) => {
                    if (err) {
                        next(new AppError(500, INTERNAL_SERVER_ERROR))
                    }
                });
            }
        } else {
            return res.sendFile("redirectFalseError.html", { root: path.join("./public") }, (err) => {
                if (err) {
                    next(new AppError(500, INTERNAL_SERVER_ERROR))
                }
            });
        }
    } catch (error) {
        console.log(error);
        return next(new AppError(500, error));
    }
}


exports.getLinks = async (req, res, next) => {
    const { page } = req.query;
    const pageInt = parseInt(page) > 0 ? parseInt(page) : 1;
    if (isNaN(pageInt)) {
        return next(new AppError(400, "Data type of page must be number."));
    }
    const limit = 20;
    const skip = pageInt ? (pageInt - 1) * limit : 0;
    try {
        const links = await LinkModel.find({
            created_by: req.user._id
        }).limit(limit).skip(skip);
        res.status(200).json({
            status: "success",
            data: {
                links
            }
        });
    } catch (error) {

    }
}