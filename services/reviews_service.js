const rxjs = require('rxjs');
const { Observable } = rxjs;
var mongoose = require('mongoose');
const StoresModel = require('../models/store');
const ReviewModel = require('../models/review');
const moment = require('moment');

class ReviewService {
    
    constructor () {

    }

    getAllReviewsByEntityId(entityId) {
        return new Observable(subscriber => {
            ReviewModel.find({reviewedEntityId: entityId}).populate('idUser').sort('-creationDate').exec((err, reviews) => {
                if (err) subscriber.error(err);
                if (reviews.length > 0) {
                    subscriber.next({status: 'success', message: 'Se obtuvieron las resenas con exito.', reviews: reviews});
                } else {
                    subscriber.next({status: 'warning', message: 'No hay resenas.'});
                }
            });
        });
    }
    
    deleteReview(idReview) {
        return new Observable(subscriber => {
            ReviewModel.findByIdAndDelete({ _id: idReview }, function (err, review) {
                if (err) subscriber.error(err);
                subscriber.next({status: 'success', message: 'Se elimino con exito.', review: review});
            });
        });
    }

    saveReview(review) {
        console.log(review);
        return new Observable(subscriber => {
            try {
                let operation_type = '';
                if (review._id == '') {
                    // si es nulo es por que es una nuevo registro de favorito.
                    review._id = mongoose.Types.ObjectId();
                    review.creationDate = moment(new Date());
                    operation_type = 'Save';
                } else {
                    review.creationDate = moment(review.creationDate);
                    operation_type = 'Update';
                }
                if (operation_type.toUpperCase() == 'SAVE') {
                    const newReview = new ReviewModel(review);
                    newReview.save((err, addedReview) => {
                        if (err) subscriber.error(err);
                        subscriber.next({status: 'success', message: 'Se agrego la resena.', review: addedReview});
                    });
                } else {
                    let review_id = review._id;
                    delete review._id;
                    ReviewModel.findOneAndUpdate(
                        { _id: review_id },
                        review,
                        {new:true},
                        (err, newReview) => {
                            if (err) subscriber.error(err);
                            subscriber.next({status: 'success', message: 'Se actualizo la resena', review: newReview});
                        }
                    );
                }
            } catch(e) {
                subscriber.error(err);
            }
        });
    }
}

module.exports = new ReviewService();