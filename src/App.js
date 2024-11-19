import { useEffect, useState } from "react";
import StarRating from "./StarRating";



const KEY="f6c70856";

export default function App() {
  const [query,setQuery]=useState("");
  const [movies, setMovies] = useState([]);
  const [watched, setWatched] = useState([]);
  const [isLoading,setIsLoading]= useState(false);
  const [error,setError] = useState("");
  const [selectedId,setSelectedId]=useState(null);


  function handleSelectMovie(id){
    setSelectedId(selectedId=>(selectedId===id)?null:id);
  }

  function handleCloseMovie(){
    setSelectedId(null);
  }

  function handleAddWatch(movie){
    setWatched((watched)=>[...watched,movie]);
  }

  function handleDeleteWatch(id){
    setWatched((watched)=>watched.filter((movie)=>movie.imdbID!==id));
  }


  useEffect(function(){
    const controller= new AbortController();

  async function fetchMovies(){
    try{
    setIsLoading(true); 
    setError("");
  const res=await fetch(`http://www.omdbapi.com/?apikey=${KEY}&s=${query}`,{signal:controller.signal});
   if(!res.ok) throw new Error("something went wrong to fetching the movies");
   
  const data = await res.json();
  if(data.Response === "False") throw new Error("movies not found");
 

  setMovies(data.Search);
   } catch(err){
      console.log(err.message);
      if(err.name !=='AbortError')setError(err.message);
   } finally{
    setIsLoading(false);
   }
  if(query.length<3){
    setMovies([]);
    setError('');
    return ;
  }

  }
   fetchMovies();
   return function(){
    controller.abort();
   }
     
   },[query]);




  return (
    <>
      <Navbar>
      <Logo/>
      <Search query={query} setQuery={setQuery}/>
      <NumResult movies={movies}/>
      </Navbar>
      <Main >
      <Box >
      {/* {isLoading?<Loader/>:<MovieList movies={movies}/>} */}
      {isLoading && <Loader/>}
      {!isLoading && !error && <MovieList movies={movies} onSelectMovie ={handleSelectMovie}/>};
      {error && <ErrorMessage message={error}/>};

      </Box>
      <Box>
      { selectedId ? <MovieDetails selectedId={selectedId} onCloseMovie={handleCloseMovie}
           onAddWatched={handleAddWatch} watched={watched}
          />
       : <>
        <WatchSummary watched={watched}/>
      <WatchMovieList watched={watched} onDeleteWatched={handleDeleteWatch}/>
        </>
      }
      </Box>
      </Main>
      
    </>
  );
}

function Loader(){
  return <p className="loader">Loading...</p>;
}

function ErrorMessage({message}){
  return(
    <p className="error">
      <span>😅</span>{message}
    </p>
  );
}


function Navbar({children}){
   return <nav className="nav-bar">
    {children}
</nav>
}

function Search({query, setQuery}){
  
  return <input
    className="search"
    type="text"
    placeholder="Search movies..."
    value={query}
    onChange={(e) => setQuery(e.target.value)}
  />
}

function Logo(){
  return <div className="logo">
    <span role="img">🍿</span>
    <h1>usePopcorn</h1>
  </div>
}

function NumResult({movies}){
   return <p className="num-results">
    Found <strong>{movies.length}</strong> results
  </p>
}

function Main({children}){
 
  
  return <main className="main">
  {children}
  
</main>
}

const average = (arr) =>
  arr.reduce((acc, cur, i, arr) => acc + cur / arr.length, 0);



function Box({children}){
  const [isOpen1, setIsOpen1] = useState(true);
  
  return <div className="box">
  <button
    className="btn-toggle"
    onClick={() => setIsOpen1((open) => !open)}
  >
    {isOpen1 ? "–" : "+"}
  </button>
  {isOpen1 && (children)}
</div>
}




/*function WatchBox(){
  const [watched, setWatched] = useState(tempWatchedData);
 
  const [isOpen2, setIsOpen2] = useState(true);

  



  return <div className="box">
  <button
    className="btn-toggle"
    onClick={() => setIsOpen2((open) => !open)}
  >
    {isOpen2 ? "–" : "+"}
  </button>
  {isOpen2 && (
    <>
      <WatchSummary watched={watched}/>
      <WatchMovieList watched={watched}/>
      
    </>
  )}
</div>
}*/


function MovieList({movies,onSelectMovie}){
  

  return <ul className="list list-movies">
  {movies?.map((movie) => (
    <Movie movie={movie} key={movie.imdbID} onSelectMovie={onSelectMovie}/>
  ))}
</ul>
}

function Movie({movie,onSelectMovie}){
  return ( <li onClick={()=>onSelectMovie(movie.imdbID)} >
  <img src={movie.Poster} alt={`${movie.Title} poster`} />
  <h3>{movie.Title}</h3>
  <div>
    <p>
      <span>🗓</span>
      <span>{movie.Year}</span>
    </p>
  </div>
</li>)
}

function MovieDetails({selectedId,onCloseMovie,onAddWatched,watched}){
  const [movie, setMovie]=useState({});
  const [isLoading,setIsLoading]=useState(false);
  const [userRating,setUserRating]=useState('');

  const isWatched= watched.map(movie => movie.imdbID).includes(selectedId);
  const watchUserRating =watched.find((movie)=>movie.imdbID===selectedId)?.userRating;

  const {
   Title:title,
   Year:year,
   Poster:poster,
   Runtime:runtime,
   imdbRating,
   Plot:plot,
   Released:released,
   Actors:actors,
   Director:director,
   Genre:genre,

  }=movie;
  
  function handleAdd(){
   const newWatchMovie={
    imdbID: selectedId,
    title,
    year,
    poster,
    imdbRating:Number(imdbRating),
    runtime:Number(runtime.split(" ").at(0)),
    userRating
   };
    onAddWatched(newWatchMovie);
    onCloseMovie();
  }
  
  useEffect(function(){
    async function getMovieDetails(){
      setIsLoading(true);
      const res=await fetch(`http://www.omdbapi.com/?apikey=${KEY}&i=${selectedId}`);
      const data= await res.json();
      console.log(data);
      setMovie(data);
      setIsLoading(false);
    }
    getMovieDetails();
  },[selectedId]);

  useEffect(function(){
    if(!title) return;
    document.title=`Movie | ${title}`;

     return function(){
      document.title="usePopcorn";

     };

  },[title]);
  
  
  return (
       
        <div className="details">
       { isLoading ? <Loader/> :
        <>
    <header>
    <button className="btn-back" onClick={onCloseMovie}>&larr;</button>
    <img src={poster} alt={`poster of ${movie} movie`}/>
     <div className="details-overview">
     <h2>{title}</h2>
     <p>{released} &bull;{runtime} {year}</p>
     <p>{genre}</p>
     <p>
      <span>⭐</span>
      {imdbRating} Imdb rating
     </p>
    </div>
    </header>
    <section>
      <div className="rating">
      {  !isWatched?
      (<> 
      <StarRating maxRating={10} size={24} onSetRating={setUserRating} />  
     
      { userRating>0 &&
        <btn className="btn-add" onClick={()=>handleAdd()}>+ Add to list</btn>
      }
      </>)

        : <p> You rated this movie {watchUserRating} </p>
      }
      </div>
      
    <p>
      <em>{plot}</em>
    </p>
    <p>staring ::{actors}</p>
    <p>directed by  {director}</p>
    </section>
    
    </>}
    </div>
  
  );
}
 

function WatchSummary({watched}){
  const avgImdbRating = average(watched.map((movie) => movie.imdbRating));
  const avgUserRating = average(watched.map((movie) => movie.userRating));
  const avgRuntime = average(watched.map((movie) => movie.runtime));

  return <div className="summary">
  <h2>Movies you watched</h2>
  <div>
    <p>
      <span>#️⃣</span>
      <span>{watched.length} movies</span>
    </p>
    <p>
      <span>⭐️</span>
      <span>{avgImdbRating.toFixed(2)}</span>
    </p>
    <p>
      <span>🌟</span>
      <span>{avgUserRating.toFixed(2)}</span>
    </p>
    <p>
      <span>⏳</span>
      <span>{avgRuntime.toFixed(2)} min</span>
    </p>
  </div>
</div>
}

function WatchMovieList({watched,onDeleteWatched}){
  return <ul className="list">
  {watched.map((movie) => (
    <WatchedMovie movie={movie} key={movie.imdbID} onDeleteWatched={onDeleteWatched}/>
  ))}
</ul>
}

function WatchedMovie({movie,onDeleteWatched}){
  return <li >
  <img src={movie.poster} alt={`${movie.title} poster`} />
  <h3>{movie.title}</h3>
  <div>
    <p>
      <span>⭐️</span>
      <span>{movie.imdbRating}</span>
    </p>
    <p>
      <span>🌟</span>
      <span>{movie.userRating}</span>
    </p>
    <p>
      <span>⏳</span>
      <span>{movie.runtime} min</span>
    </p>
   <button className="btn-delete" onClick={()=>onDeleteWatched(movie.imdbID)}>
     X
   </button>
  </div>
</li>
}
