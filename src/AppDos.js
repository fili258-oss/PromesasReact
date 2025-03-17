import { useState, useEffect, useCallback } from 'react';
import Person from './Person';
import SearchForm from './SearchForm';
import './App.css';
import axios from 'axios';

function App() {
  const [peopleAxios, setPeopleAxios] = useState([]);
  const [peopleFetch, setPeopleFetch] = useState([]);
  const [gender, setGender] = useState();
  const [country, setCountry] = useState('US');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [axiosTime, setAxiosTime] = useState(null);
  const [fetchTime, setFetchTime] = useState(null);

  const apiUrl = `https://randomuser.me/api/?results=12&gender=${gender || ''}&nat=${country}`;

  // ✅ Función con Axios (Optimizada)
  const findPeopleAxios = useCallback(async () => {
    if (isLoading) return; // Evitar múltiples solicitudes simultáneas

    setIsLoading(true);
    setError(null);

    const startTime = performance.now(); // Iniciar medición de tiempo

    try {
      const response = await axios.get(apiUrl);
      setPeopleAxios(response.data.results);
      setAxiosTime(performance.now() - startTime); // Calcular tiempo de respuesta
    } catch (error) {
      if (error.response) {
        setError(`Error HTTP: ${error.response.status} - ${error.response.statusText}`);
      } else if (error.request) {
        setError("Error de red. No se recibió respuesta del servidor.");
      } else {
        setError("Error desconocido: " + error.message);
      }
    } finally {
      setIsLoading(false);
    }
  }, [apiUrl, isLoading]);

  // ✅ Función con Fetch (Optimizada)
  const findPeopleFetch = useCallback(async () => {
    if (isLoading) return;

    setIsLoading(true);
    setError(null);

    const startTime = performance.now();

    try {
      const response = await fetch(apiUrl);

      if (!response.ok) {
        throw new Error(`Error HTTP: ${response.status} - ${response.statusText}`);
      }

      const data = await response.json();
      setPeopleFetch(data.results);
      setFetchTime(performance.now() - startTime);
    } catch (error) {
      setError("Error con Fetch: " + error.message);
    } finally {
      setIsLoading(false);
    }
  }, [apiUrl, isLoading]);

  // ✅ Comparación con Promise.all()
  const findPeopleBoth = useCallback(async () => {
    if (isLoading) return;

    setIsLoading(true);
    setError(null);

    try {
      const startTime = performance.now();

      const [axiosResponse, fetchResponse] = await Promise.all([
        axios.get(apiUrl).then(res => res.data.results),
        fetch(apiUrl).then(res => {
          if (!res.ok) throw new Error(`Fetch Error: ${res.status}`);
          return res.json();
        }).then(data => data.results)
      ]);

      setPeopleAxios(axiosResponse);
      setPeopleFetch(fetchResponse);

      const totalTime = performance.now() - startTime;
      setAxiosTime(totalTime);
      setFetchTime(totalTime);
    } catch (error) {
      setError("Error en la comparación de Fetch y Axios: " + error.message);
    } finally {
      setIsLoading(false);
    }
  }, [apiUrl, isLoading]);

  useEffect(() => {
    findPeopleBoth();
  }, [gender, country, findPeopleBoth]);

  return (
    <div className="App">
      <h1>Random People</h1>
      <div className="App-settings">
        <div>Gender: {gender || "all"}</div>
        <div>Country: {country}</div>
      </div>

      <SearchForm handleGender={(e) => setGender(e.target.value)} handleCountry={(e) => setCountry(e.target.value)} country={country} />

      <div className="App-button">
        <button onClick={findPeopleAxios} disabled={isLoading}>Fetch with Axios</button>
        <button onClick={findPeopleFetch} disabled={isLoading}>Fetch with Fetch</button>
        <button onClick={findPeopleBoth} disabled={isLoading}>Compare Both</button>
      </div>

      {error && <p className="error-message">{error}</p>}
      {isLoading && <p>Loading...</p>}

      <h2>Axios Results {axiosTime && `(${axiosTime.toFixed(2)} ms)`}</h2>
      <div className="App-people">
        {peopleAxios.map((person) => <Person key={person.login.uuid} person={person} />)}
      </div>

      <h2>Fetch Results {fetchTime && `(${fetchTime.toFixed(2)} ms)`}</h2>
      <div className="App-people">
        {peopleFetch.map((person) => <Person key={person.login.uuid} person={person} />)}
      </div>
    </div>
  );
}

export default App;
