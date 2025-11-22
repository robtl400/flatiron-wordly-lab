
document.addEventListener('DOMContentLoaded', function() {
  
  // Get elements
  const searchForm = document.getElementById('search-form');
  const wordInput = document.getElementById('word-input');
  const errorMessage = document.getElementById('error-message');
  const results = document.getElementById('results');
  const wordTitle = document.getElementById('word-title');
  const phoneticText = document.getElementById('phonetic');
  const audioButton = document.getElementById('audio-button');
  const definitionsContainer = document.getElementById('definitions-container');
  const synonymsSection = document.getElementById('synonyms-section');
  const synonymsList = document.getElementById('synonyms-list');
  const sourceSection = document.getElementById('source-section');
  const sourceLink = document.getElementById('source-link');
  
  let audioUrl = '';
  
  // Form submission
  searchForm.addEventListener('submit', function(event) {
    event.preventDefault();
    
    // Get the word
    const word = wordInput.value.trim().toLowerCase();

    if (word === '') {
      showError('Please enter word');
      return;
    }
    
    // Search for the word
    searchWord(word);
  });
  
  // Audio button
  audioButton.addEventListener('click', function() {
    if (audioUrl) {
      const audio = new Audio(audioUrl);
      audio.play();
    }
  });
  

  function searchWord(word) {

    hideError();
    hideResults();
    
    // Fetch data from API
    fetch(`https://api.dictionaryapi.dev/api/v2/entries/en/${word}`)
      .then(function(response) {
        if (!response.ok) {
          throw new Error('Word not found');
        }
        return response.json();
      })
      .then(function(data) {
        displayResults(data[0]);
      })
      .catch(function(error) {
        showError('That is not a word. Please try again');
      });
  }
  
  // Function to display results
  function displayResults(data) {
    wordTitle.textContent = data.word;
    
    if (data.phonetic) {
      phoneticText.textContent = data.phonetic;
    } else {
      phoneticText.textContent = '';
    }
    
    audioUrl = '';
    if (data.phonetics && data.phonetics.length > 0) {
      for (let i = 0; i < data.phonetics.length; i++) {
        if (data.phonetics[i].audio) {
          audioUrl = data.phonetics[i].audio;
          audioButton.classList.remove('hidden');
          break;
        }
      }
    }
    
    if (!audioUrl) {
      audioButton.classList.add('hidden');
    }
    
    definitionsContainer.innerHTML = '';
    
    if (data.meanings && data.meanings.length > 0) {
      for (let i = 0; i < data.meanings.length; i++) {
        const meaning = data.meanings[i];
        
        // Create a div for this part of speech
        const meaningDiv = document.createElement('div');
        meaningDiv.className = 'definition-item';
        
        const partOfSpeech = document.createElement('h3');
        partOfSpeech.textContent = meaning.partOfSpeech;
        meaningDiv.appendChild(partOfSpeech);
        
        // Definitions
        if (meaning.definitions && meaning.definitions.length > 0) {
          for (let j = 0; j < meaning.definitions.length; j++) {
            const def = meaning.definitions[j];
            
            // Add definition text
            const defText = document.createElement('p');
            defText.textContent = `${j + 1}. ${def.definition}`;
            meaningDiv.appendChild(defText);
            
            // Add example if available
            if (def.example) {
              const example = document.createElement('p');
              example.className = 'example';
              example.textContent = `Example: "${def.example}"`;
              meaningDiv.appendChild(example);
            }
          }
        }
        
        definitionsContainer.appendChild(meaningDiv);
      }
    }
    
    // Display synonyms
    const allSynonyms = [];
    if (data.meanings && data.meanings.length > 0) {
      for (let i = 0; i < data.meanings.length; i++) {
        if (data.meanings[i].synonyms && data.meanings[i].synonyms.length > 0) {
          for (let j = 0; j < data.meanings[i].synonyms.length; j++) {
            allSynonyms.push(data.meanings[i].synonyms[j]);
          }
        }
      }
    }
    
    if (allSynonyms.length > 0) {
      synonymsList.textContent = allSynonyms.join(', ');
      synonymsSection.classList.remove('hidden');
    } else {
      synonymsSection.classList.add('hidden');
    }
    
    // Source
    if (data.sourceUrls && data.sourceUrls.length > 0) {
      sourceLink.href = data.sourceUrls[0];
      sourceSection.classList.remove('hidden');
    } else {
      sourceSection.classList.add('hidden');
    }
    
    results.classList.remove('hidden');
  }
  
  // Error function
  function showError(message) {
    errorMessage.textContent = message;
    errorMessage.classList.remove('hidden');
    hideResults();
  }
  
  function hideError() {
    errorMessage.textContent = '';
    errorMessage.classList.add('hidden');
  }
  
  function hideResults() {
    results.classList.add('hidden');
  }
  
});