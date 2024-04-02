import { CacheSaveTypes } from "../utils/cache.js";



class Movie {
    constructor(memDbCache) {
        this._memDb = memDbCache;
        this._category = null;
        this._tableMapping = {
            LATEST_FILMS:"latest-films",
            TV_SHOWS:"tv-shows",
        }
        
        
        if (typeof this._memDb !== "object") {
            throw new Error("The memDB must be an object!");
        }
    }

    _mapCacheToTableName(category) {
        switch (category) {
            case CacheSaveTypes.movies:
                return this._tableMapping.LATEST_FILMS;
            case CacheSaveTypes.tvShows:
                return this._tableMapping.TV_SHOWS;
            case CacheSaveTypes.search:
                return CacheSaveTypes.search;
        }
    }

    get category() {
        return this._category;
    }

    setCategory(category) {
        this._category = category;
    }

    findMovieByIdAndQuery(id, searchQuery) {
        return this._findMovieHelper(id, searchQuery);
    }

    getMovieByID(id) {
        return this._findMovieHelper(id);
    }

    _findMovieHelper(id, searchQuery = null) {
        if (!this._category) {
            throw new Error("The category is not set");
        }

        let tableName;

        if (searchQuery === null) {
            tableName = this._mapCacheToTableName(this._category);
        } else {
            tableName = searchQuery.toLowerCase();
        }

        const movies = this._memDb?.[this._category]?.[0][tableName]?.[0].results; // list of movie objects

        if (movies) {
            const movie = movies.find(movie => String(movie.id) === String(id));
            return movie ? movie : null;
        }
        
        return null;
    }
}

export default Movie;
