import { CacheSaveTypes } from "../utils/cache.js";


class Movie{
    constructor(memDbCacheInstant) {
        this._memDb   = memDbCacheInstant;
        this._category = null;

        if (typeof this._memDb !== "object") {
            throw new Error("The memDB must be an object!");
        }
    }

    _mapCacheToTableName(category) {

        switch(true) {
            case category === CacheSaveTypes.movies:
                return "latest-films";
            case category === CacheSaveTypes.tvShows:
                category 
                return "tv-shows";
            case category === CacheSaveTypes.search:
                return CacheSaveTypes.search;
        }
    }

    get category() {
        this._category
    }

    setCategory(category) {
        this._category = category;
    }


    getMovieByID(id) {

        if (!this._category) {
            throw new Error("The category is not set");
        }


        const tableName = this._mapCacheToTableName(this._category);
        console.log(this._category)
        console.log(this._memDb)
        const movies    = this._memDb?.[this._category]?.[0][tableName]?.[0].results; // list of movies objects
        
        console.log(tableName);
        const movie = movies.find(movie => String(movie.id) === String(id));
        return movie ? movie : null;
     
    }

    getMovieByTitle(title) {
        
    }

    getAllMovies() {
        const mainSection = this._memDb.getCacheByName(CacheSaveTypes.default);
        if (mainSection) {
            const moviesArray = mainSection.movies[0].movies.results;
            const pageNumber  = mainSection.movies[0].movies.page;
            return [moviesArray, pageNumber];
        }
    }

    getAllTVShows() {

    }

}

export default Movie;