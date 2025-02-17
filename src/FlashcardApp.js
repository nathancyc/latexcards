import React, { useState, useEffect, useRef } from 'react';
import katex from 'katex';
import 'katex/dist/katex.min.css';
import renderMathInElement from 'katex/contrib/auto-render/auto-render';

/* -------------------------------------------------------------------------- */
/* MacroModal (unchanged from previous) */
/* -------------------------------------------------------------------------- */
function MacroModal({ onClose, onAddOrUpdateMacro, macroList }) {
  const [quickCommand, setQuickCommand] = useState('');
  const [quickDefinition, setQuickDefinition] = useState('');
  const [editingIndex, setEditingIndex] = useState(null);

  const containerRef = useRef(null);
  const commandInputRef = useRef(null);
  const definitionInputRef = useRef(null);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Enter') {
        if (
          document.activeElement === commandInputRef.current ||
          document.activeElement === definitionInputRef.current
        ) {
          e.preventDefault();
          handleQuickAction();
        }
      } else if (e.key === 'Escape') {
        e.preventDefault();
        handleClose();
      }
    };
    const containerEl = containerRef.current;
    containerEl.addEventListener('keydown', handleKeyDown);
    return () => {
      containerEl.removeEventListener('keydown', handleKeyDown);
    };
  }, [quickCommand, quickDefinition]);

  const handleQuickAction = () => {
    if (!quickCommand.trim() || !quickDefinition.trim()) return;
    onAddOrUpdateMacro(quickCommand.trim(), quickDefinition.trim(), editingIndex);
    setQuickCommand('');
    setQuickDefinition('');
    setEditingIndex(null);
  };

  const handleClose = () => {
    onClose();
  };

  const handleEditClick = (index) => {
    const macro = macroList[index];
    setQuickCommand(macro.command);
    setQuickDefinition(macro.definition);
    setEditingIndex(index);
  };

  const handleRemoveClick = (index) => {
    onAddOrUpdateMacro(null, null, index, true);
  };

  return (
    <div
      ref={containerRef}
      style={{
        position: 'fixed',
        top: 0, left: 0, right: 0, bottom: 0,
        backgroundColor: 'rgba(0,0,0,0.5)',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center'
      }}
    >
      <div style={{ backgroundColor: 'white', padding: '1rem', width: '400px', borderRadius: '5px' }}>
        <h2>Define Macros</h2>
        <div style={{ marginBottom: '1rem' }}>
          <h3>Quick {editingIndex !== null ? 'Edit' : 'Add'}</h3>
          <input
            ref={commandInputRef}
            type="text"
            placeholder="Command (e.g. \C)"
            value={quickCommand}
            onChange={e => setQuickCommand(e.target.value)}
            style={{ width: '100%', marginBottom: '0.5rem', boxSizing: 'border-box' }}
          />
          <input
            ref={definitionInputRef}
            type="text"
            placeholder="Definition (e.g. \mathbb{C})"
            value={quickDefinition}
            onChange={e => setQuickDefinition(e.target.value)}
            style={{ width: '100%', marginBottom: '0.5rem', boxSizing: 'border-box' }}
          />
        </div>

        {macroList.length > 0 && (
          <div>
            <h3>Current Macros</h3>
            <ul style={{ marginTop: '0.5rem', listStyle: 'none', padding: 0 }}>
              {macroList.map((m, index) => (
                <li key={index} style={{ marginBottom: '0.5rem' }}>
                  <div>
                    <strong>{m.command}</strong> = {m.definition}
                  </div>
                  <div style={{ marginTop: '0.3rem' }}>
                    <button
                      onClick={() => handleEditClick(index)}
                      style={{ marginRight: '0.5rem', padding: '0.3rem 0.6rem' }}
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleRemoveClick(index)}
                      style={{ padding: '0.3rem 0.6rem' }}
                    >
                      Remove
                    </button>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        )}
        <div style={{ marginTop: '1rem', display: 'flex', justifyContent: 'space-between' }}>
          <button onClick={handleQuickAction}>
            {editingIndex !== null ? 'Update Macro' : 'Add Macro'}
          </button>
          <button onClick={handleClose}>
            Close
          </button>
        </div>
      </div>
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/* TagModal (updated to handle ESC anywhere) */
/* -------------------------------------------------------------------------- */
function TagModal({ onClose, onSave, currentTags, allTags }) {
  const [localAllTags, setLocalAllTags] = useState([...allTags]);
  const [selectedTags, setSelectedTags] = useState(currentTags || []);
  const [newTag, setNewTag] = useState('');

  const containerRef = useRef(null);
  const newTagInputRef = useRef(null);

  // Global keydown listener (capture phase) for ESC/Enter
  useEffect(() => {
    const handleGlobalKeyDown = (e) => {
      if (e.key === 'Enter') {
        if (document.activeElement === newTagInputRef.current) {
          e.preventDefault();
          handleAddNewTag();
        } else {
          e.preventDefault();
          handleSave();
        }
        // Prevent the event from reaching background components
        e.stopPropagation();
      } else if (e.key === 'Escape') {
        e.preventDefault();
        e.stopPropagation();
        handleSave();
      }
    };
    document.addEventListener('keydown', handleGlobalKeyDown, true);
    return () => {
      document.removeEventListener('keydown', handleGlobalKeyDown, true);
    };
  }, [selectedTags, newTag]);

  const handleCheckboxChange = (tag, checked) => {
    if (checked) {
      if (!selectedTags.includes(tag)) {
        setSelectedTags([...selectedTags, tag]);
      }
    } else {
      setSelectedTags(selectedTags.filter(t => t !== tag));
    }
  };

  const handleAddNewTag = () => {
    const trimmed = newTag.trim();
    if (!trimmed) return;
    if (!localAllTags.includes(trimmed)) {
      setLocalAllTags([...localAllTags, trimmed]);
    }
    if (!selectedTags.includes(trimmed)) {
      setSelectedTags([...selectedTags, trimmed]);
    }
    setNewTag('');
  };

  const handleSave = () => {
    onSave(selectedTags, localAllTags);
    onClose();
  };

  return (
    <div
      ref={containerRef}
      style={{
        position: 'fixed',
        top: 0, left: 0, right: 0, bottom: 0,
        zIndex: 3000,
        backgroundColor: 'rgba(0,0,0,0.5)',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center'
      }}
    >
      <div style={{ backgroundColor: 'white', padding: '1rem', width: '300px', borderRadius: '5px' }}>
        <h2>Tag Flashcard</h2>
        
        <div>
          <h3>Select Existing Tags:</h3>
          {localAllTags.length === 0 && <p>No tags available.</p>}
          {localAllTags.map((tag, idx) => (
            <div key={idx}>
              <input
                type="checkbox"
                id={`tag-${idx}`}
                checked={selectedTags.includes(tag)}
                onChange={(e) => handleCheckboxChange(tag, e.target.checked)}
              />
              <label htmlFor={`tag-${idx}`}>{tag}</label>
            </div>
          ))}
        </div>

        <div style={{ marginTop: '1rem' }}>
          <h3>Add New Tag:</h3>
          <input
            ref={newTagInputRef}
            type="text"
            placeholder="New tag"
            value={newTag}
            onChange={(e) => setNewTag(e.target.value)}
            style={{ width: '100%', boxSizing: 'border-box' }}
          />
        </div>

        <div style={{ marginTop: '0.5rem', display: 'flex', justifyContent: 'space-between' }}>
          <button onClick={handleAddNewTag}>Add Tag</button>
          <button onClick={handleSave}>Close</button>
        </div>
      </div>
    </div>
  );
}



/* -------------------------------------------------------------------------- */
/* FlashcardItem 
   - We add a new "Delete" button that calls onDelete().
*/
/* -------------------------------------------------------------------------- */
function FlashcardItem({ card, index, macros, onEdit, onTag, onDelete }) {
  const frontRef = useRef(null);
  const backRef = useRef(null);

  useEffect(() => {
    const processText = (text) => text.replace(/\/\/+/g, "\n");
    const addDisplayStyle = (text) => {
      const inlineRegex = /(?<!\$)\$(?!\$)([\s\S]+?)(?<!\$)\$(?!\$)/g;
      return text.replace(inlineRegex, (match, content) => `$\\displaystyle ${content}$`);
    };

    const processedFront = addDisplayStyle(processText(card.front));
    const processedBack = addDisplayStyle(processText(card.back));

    if (frontRef.current) {
      frontRef.current.innerHTML = processedFront;
      renderMathInElement(frontRef.current, {
        delimiters: [
          { left: '$$', right: '$$', display: true },
          { left: '\\[', right: '\\]', display: true },
          { left: '$', right: '$', display: false }
        ],
        throwOnError: false,
        macros: macros
      });
    }
    if (backRef.current) {
      backRef.current.innerHTML = processedBack;
      renderMathInElement(backRef.current, {
        delimiters: [
          { left: '$$', right: '$$', display: true },
          { left: '\\[', right: '\\]', display: true },
          { left: '$', right: '$', display: false }
        ],
        throwOnError: false,
        macros: macros
      });
    }
  }, [card, macros]);
  
  return (
    <div style={{ border: '1px solid #ccc', padding: '1rem', marginBottom: '1rem' }}>
      <div style={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center', 
        marginBottom: '0.5rem' 
      }}>
        <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
          <button onClick={onEdit} style={{ padding: '0.3rem 0.6rem' }}>Edit</button>
          <button onClick={onTag} style={{ padding: '0.3rem 0.6rem' }}>Tag</button>
          {/* NEW: Delete button */}
          <button onClick={onDelete} style={{ padding: '0.3rem 0.6rem', backgroundColor: '#dc3545', color: 'white' }}>
            Delete
          </button>
        </div>
        <div>
          <strong>Tags:</strong> {card.tags && card.tags.length > 0 ? card.tags.join(', ') : 'None'}
        </div>
      </div>
      <div style={{ display: 'flex', gap: '1rem' }}>
        <div style={{ flex: 1 }} ref={frontRef} />
        <div style={{ flex: 1 }} ref={backRef} />
      </div>
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/* RenderedCard (preserves line breaks, left-aligned) */
/* -------------------------------------------------------------------------- */
function RenderedCard({ text, macros }) {
  const cardRef = useRef(null);

  useEffect(() => {
    const processText = (t) => t.replace(/\/\/+/g, "\n");
    const addDisplayStyle = (t) => {
      const inlineRegex = /(?<!\$)\$(?!\$)([\s\S]+?)(?<!\$)\$(?!\$)/g;
      return t.replace(inlineRegex, (match, content) => `$\\displaystyle ${content}$`);
    };

    const processed = addDisplayStyle(processText(text));
    if (cardRef.current) {
      cardRef.current.innerHTML = processed;
      renderMathInElement(cardRef.current, {
        delimiters: [
          { left: '$$', right: '$$', display: true },
          { left: '\\[', right: '\\]', display: true },
          { left: '$', right: '$', display: false }
        ],
        throwOnError: false,
        macros: macros
      });
    }
  }, [text, macros]);

  return (
    <div
      ref={cardRef}
      style={{ whiteSpace: 'pre-wrap', textAlign: 'left' }}
    />
  );
}

/* -------------------------------------------------------------------------- */
/* FlashcardViewerModal (unchanged) */
/* -------------------------------------------------------------------------- */
function FlashcardViewerModal({
  flashcards,
  macros,
  onClose,
  onEditCard,
  onTagCard,
  viewerTagFilter,
  setViewerTagFilter,
  allTags
}) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [showingFront, setShowingFront] = useState(true);
  const [cards, setCards] = useState([]);

  // Filter cards by viewerTagFilter
  useEffect(() => {
    let relevantCards = flashcards.map((card, i) => ({ ...card, _originalIndex: i }));
    if (viewerTagFilter !== 'No Filter') {
      relevantCards = relevantCards.filter((c) => c.tags && c.tags.includes(viewerTagFilter));
    }
    setCards(relevantCards);
    setCurrentIndex(0);
    setShowingFront(true);
  }, [flashcards, viewerTagFilter]);

  // Keydown for flipping, arrow nav, escape
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'ArrowLeft') {
        setCurrentIndex((prev) => (prev - 1 + cards.length) % cards.length);
        setShowingFront(true);
      } else if (e.key === 'ArrowRight') {
        setCurrentIndex((prev) => (prev + 1) % cards.length);
        setShowingFront(true);
      } else if (e.key === ' ') {
        e.preventDefault();
        setShowingFront((prev) => !prev);
      } else if (e.key === 'Escape') {
        onClose();
      }
    };
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [cards, onClose]);

  const handleFlip = () => {
    setShowingFront((prev) => !prev);
  };

  const handleShuffle = () => {
    const shuffled = [...cards].sort(() => Math.random() - 0.5);
    setCards(shuffled);
    setCurrentIndex(0);
    setShowingFront(true);
  };

  const handleEditClick = () => {
    if (cards.length === 0) return;
    const origIndex = cards[currentIndex]._originalIndex;
    onClose();
    onEditCard(origIndex);
  };

  const handleTagClick = () => {
    if (cards.length === 0) return;
    const origIndex = cards[currentIndex]._originalIndex;
    // Do not close the viewer here, so the TagModal overlays it
    onTagCard(origIndex);
  };

  const currentCard = cards[currentIndex];

  return (
    <div className="flashcard-modal-overlay" onClick={onClose}>
      <div className="flashcard-modal" onClick={(e) => e.stopPropagation()}>
        <span className="close-btn" onClick={onClose}>&times;</span>

        {/* Viewer Tag Filter */}
        <div style={{ marginBottom: '0.75rem' }}>
          <label style={{ fontWeight: 'bold', marginRight: '0.5rem' }}>Filter by Tag:</label>
          <select
            value={viewerTagFilter}
            onChange={(e) => setViewerTagFilter(e.target.value)}
            style={{ padding: '0.3rem' }}
          >
            <option value="No Filter">No Filter</option>
            {allTags.map((tag) => (
              <option key={tag} value={tag}>{tag}</option>
            ))}
          </select>
        </div>

        {/* Front/Back Indicator */}
        <div style={{ marginBottom: '0.5rem', fontWeight: 'bold', fontSize: '1.2rem' }}>
          {showingFront ? 'Front' : 'Back'}
        </div>

        {/* Flashcard Content */}
        <div className="flashcard" onClick={handleFlip}>
          {cards.length > 0 ? (
            showingFront
              ? <RenderedCard text={currentCard.front} macros={macros} />
              : <RenderedCard text={currentCard.back} macros={macros} />
          ) : (
            'No flashcards available.'
          )}
        </div>

        {/* Navigation */}
        <div>
          <button
            className="btn nav-button"
            onClick={() => {
              setCurrentIndex((currentIndex - 1 + cards.length) % cards.length);
              setShowingFront(true);
            }}
          >
            &#8592;
          </button>
          <button
            className="btn nav-button"
            onClick={() => {
              setCurrentIndex((currentIndex + 1) % cards.length);
              setShowingFront(true);
            }}
          >
            &#8594;
          </button>
        </div>

        {/* Shuffle, Edit, Tag */}
        <div style={{ marginTop: '1rem' }}>
          <button className="btn shuffle-btn" onClick={handleShuffle}>
            Shuffle
          </button>
          {' '}
          <button className="btn shuffle-btn" onClick={handleEditClick}>
            Edit
          </button>
          {' '}
          <button className="btn shuffle-btn" onClick={handleTagClick}>
            Tag
          </button>
        </div>
      </div>
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/* FlashcardApp 
   - Now includes a delete handler for the new Delete button
*/
/* -------------------------------------------------------------------------- */
function FlashcardApp() {
  const [front, setFront] = useState('');
  const [back, setBack] = useState('');
  const [flashcards, setFlashcards] = useState([]);
  const [editingIndex, setEditingIndex] = useState(null);

  const [macros, setMacros] = useState({});
  const [macroList, setMacroList] = useState([]);
  const [showMacroModal, setShowMacroModal] = useState(false);

  const [allTags, setAllTags] = useState([]);
  const [tagModalFlashcardIndex, setTagModalFlashcardIndex] = useState(null);
  const [selectedTagFilter, setSelectedTagFilter] = useState('All');

  const [viewerTagFilter, setViewerTagFilter] = useState('No Filter');
  const [showFlashcardViewer, setShowFlashcardViewer] = useState(false);

  const frontPreviewRef = useRef(null);
  const backPreviewRef = useRef(null);

  useEffect(() => {
    const processText = (text) => text.replace(/\/\/+/g, "\n");
    const addDisplayStyle = (text) => {
      const inlineRegex = /(?<!\$)\$(?!\$)([\s\S]+?)(?<!\$)\$(?!\$)/g;
      return text.replace(inlineRegex, (match, content) => `$\\displaystyle ${content}$`);
    };

    const processedFront = addDisplayStyle(processText(front));
    const processedBack = addDisplayStyle(processText(back));

    if (frontPreviewRef.current) {
      frontPreviewRef.current.innerHTML = processedFront;
      renderMathInElement(frontPreviewRef.current, {
        delimiters: [
          { left: '$$', right: '$$', display: true },
          { left: '\\[', right: '\\]', display: true },
          { left: '$', right: '$', display: false }
        ],
        throwOnError: false,
        macros: macros
      });
    }
    if (backPreviewRef.current) {
      backPreviewRef.current.innerHTML = processedBack;
      renderMathInElement(backPreviewRef.current, {
        delimiters: [
          { left: '$$', right: '$$', display: true },
          { left: '\\[', right: '\\]', display: true },
          { left: '$', right: '$', display: false }
        ],
        throwOnError: false,
        macros: macros
      });
    }
  }, [front, back, macros]);

  const handleSubmitFlashcard = () => {
    const newFlashcard = { front, back, tags: [] };
    if (editingIndex !== null) {
      const updated = flashcards.map((card, idx) =>
        idx === editingIndex ? { ...newFlashcard, tags: card.tags } : card
      );
      setFlashcards(updated);
      setEditingIndex(null);
    } else {
      setFlashcards([newFlashcard, ...flashcards]);
    }
    setFront('');
    setBack('');
  };

  const handleEditCard = (index) => {
    const card = flashcards[index];
    setFront(card.front);
    setBack(card.back);
    setEditingIndex(index);
  };

  // NEW: Delete flashcard
  const handleDeleteCard = (index) => {
    const updated = flashcards.filter((_, i) => i !== index);
    setFlashcards(updated);
  };

  const openTagModal = (index) => {
    setTagModalFlashcardIndex(index);
  };

  const handleSaveTags = (tags) => {
    if (tagModalFlashcardIndex === null) return;
    const newGlobalTags = [...allTags];
    tags.forEach(tag => {
      if (!newGlobalTags.includes(tag)) {
        newGlobalTags.push(tag);
      }
    });
    setAllTags(newGlobalTags);

    const updatedFlashcards = flashcards.map((card, idx) =>
      idx === tagModalFlashcardIndex ? { ...card, tags } : card
    );
    setFlashcards(updatedFlashcards);
    setTagModalFlashcardIndex(null);
  };

  // Filter for main page
  const filteredFlashcards =
    selectedTagFilter === 'All'
      ? flashcards
      : flashcards.filter(card => card.tags && card.tags.includes(selectedTagFilter));

  const handleAddOrUpdateMacro = (command, definition, index = null, isRemove = false) => {
    let newList = [...macroList];
    if (isRemove && index !== null) {
      newList = newList.filter((_, i) => i !== index);
    } else if (index !== null) {
      newList[index] = { command, definition };
    } else {
      const existing = newList.findIndex(m => m.command === command);
      if (existing >= 0) {
        newList[existing] = { command, definition };
      } else {
        newList.push({ command, definition });
      }
    }
    setMacroList(newList);
    const newMacros = newList.reduce((acc, m) => {
      acc[m.command] = m.definition;
      return acc;
    }, {});
    setMacros(newMacros);
  };

  const handleExport = async () => {
    const data = JSON.stringify({ flashcards, allTags, macroList }, null, 2);
    if (window.showSaveFilePicker) {
      try {
        const opts = {
          types: [
            {
              description: 'JSON Files',
              accept: { 'application/json': ['.json'] },
            },
          ],
        };
        const fileHandle = await window.showSaveFilePicker(opts);
        const writableStream = await fileHandle.createWritable();
        await writableStream.write(data);
        await writableStream.close();
      } catch (err) {
        console.error('Export canceled or failed: ', err);
      }
    } else {
      const blob = new Blob([data], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'flashcards.json';
      a.click();
      URL.revokeObjectURL(url);
    }
  };

  const handleImport = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (evt) => {
      try {
        const data = JSON.parse(evt.target.result);
        if (data.flashcards) setFlashcards(data.flashcards);
        if (data.allTags) setAllTags(data.allTags);
        if (data.macroList) {
          setMacroList(data.macroList);
          const newMacros = data.macroList.reduce((acc, m) => {
            acc[m.command] = m.definition;
            return acc;
          }, {});
          setMacros(newMacros);
        }
      } catch (error) {
        alert("Error importing flashcards: " + error);
      }
    };
    reader.readAsText(file);

    // IMPORTANT: reset the file input so we can import again
    e.target.value = null;
  };

  return (
    <div style={{ padding: '2rem' }}>
      <h1>LaTeX Flashcard Creator</h1>

      {/* Front/Back Editor Section */}
      <div style={{ display: 'flex', gap: '1rem', marginBottom: '1rem' }}>
        <div style={{ flex: 1 }}>
          <h2>Front</h2>
          <textarea
            className="latexTextbox"
            rows={10}
            placeholder="Enter front content..."
            value={front}
            onChange={e => setFront(e.target.value)}
          />
          <div>
            <h3>Preview</h3>
            <div ref={frontPreviewRef} className="previewContainer" />
          </div>
        </div>
        <div style={{ flex: 1 }}>
          <h2>Back</h2>
          <textarea
            className="latexTextbox"
            rows={10}
            placeholder="Enter back content..."
            value={back}
            onChange={e => setBack(e.target.value)}
          />
          <div>
            <h3>Preview</h3>
            <div ref={backPreviewRef} className="previewContainer" />
          </div>
        </div>
      </div>

      {/* Buttons below the previews */}
      <div style={{ display: 'flex', gap: '1rem', marginBottom: '1rem' }}>
        <button className="btn" onClick={() => setShowMacroModal(true)}>
          Define Macros
        </button>
        <button className="btn" onClick={handleSubmitFlashcard}>
          {editingIndex !== null ? 'Update Flashcard' : 'Submit Flashcard'}
        </button>
        <button className="btn" onClick={handleExport}>
          Export
        </button>
        <label className="btn" style={{ cursor: 'pointer', margin: 0 }}>
          Import
          <input
            type="file"
            onChange={handleImport}
            style={{ display: 'none' }}
            accept="application/json"
          />
        </label>
        <button className="btn" onClick={() => setShowFlashcardViewer(true)}>
          View Flashcards
        </button>
      </div>

      {/* Tag Filter for the main list */}
      <div style={{ marginBottom: '1rem' }}>
        <label htmlFor="tagFilter"><strong>Filter by Tag:</strong></label>
        <select
          id="tagFilter"
          value={selectedTagFilter}
          onChange={(e) => setSelectedTagFilter(e.target.value)}
          style={{ padding: '0.3rem', marginLeft: '0.5rem' }}
        >
          <option value="All">All</option>
          {allTags.map((tag, idx) => (
            <option key={idx} value={tag}>{tag}</option>
          ))}
        </select>
      </div>

      {/* Submitted Flashcards */}
      <div>
        <h2>Submitted Flashcards</h2>
        {filteredFlashcards.map((card, index) => (
          <FlashcardItem
            key={index}
            index={index}
            card={card}
            macros={macros}
            onEdit={() => handleEditCard(index)}
            onTag={() => openTagModal(index)}
            onDelete={() => handleDeleteCard(index)}  // NEW
          />
        ))}
      </div>

      {/* Macro Modal */}
      {showMacroModal && (
        <MacroModal
          onClose={() => setShowMacroModal(false)}
          onAddOrUpdateMacro={handleAddOrUpdateMacro}
          macroList={macroList}
        />
      )}

      {/* Tag Modal */}
      {tagModalFlashcardIndex !== null && (
        <TagModal
          onClose={() => setTagModalFlashcardIndex(null)}
          onSave={handleSaveTags}
          currentTags={flashcards[tagModalFlashcardIndex]?.tags || []}
          allTags={allTags}
        />
      )}

      {/* Flashcard Viewer */}
      {showFlashcardViewer && (
        <FlashcardViewerModal
          flashcards={flashcards}
          macros={macros}
          onClose={() => setShowFlashcardViewer(false)}
          onEditCard={handleEditCard}
          onTagCard={openTagModal}
          viewerTagFilter={viewerTagFilter}
          setViewerTagFilter={setViewerTagFilter}
          allTags={allTags}
        />
      )}
    </div>
  );
}

export default FlashcardApp;
