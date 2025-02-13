import React, { useState, useEffect, useRef } from 'react';
import katex from 'katex';
import 'katex/dist/katex.min.css';
import renderMathInElement from 'katex/contrib/auto-render/auto-render';

/* MacroModal: 
   Provides a quick-add interface for macros and displays the list of currently defined macros.
   When you click "Edit" next to a macro, it pre-fills the quick-add inputs (without immediately deleting the macro).
*/
function MacroModal({ onClose, onAddOrUpdateMacro, macroList }) {
  const [quickCommand, setQuickCommand] = useState('');
  const [quickDefinition, setQuickDefinition] = useState('');
  const [editingIndex, setEditingIndex] = useState(null);

  // Refs for the modal container and the input fields
  const containerRef = useRef(null);
  const commandInputRef = useRef(null);
  const definitionInputRef = useRef(null);

  // Key handler:
  // - If either input is focused and Enter is pressed, trigger add/update action.
  // - If Escape is pressed, close the modal.
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

        {/* Existing Macros List */}
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
        {/* Bottom Buttons: "Add Macro" (or "Update Macro") on left, "Close" on right */}
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

/* TagModal:
   Allows you to assign tags to a flashcard. You can choose from pre-existing tags (checkboxes)
   or add a new tag. On Save, it returns the selected tags.
*/
function TagModal({ onClose, onSave, currentTags, allTags }) {
  // Local copy of all tags so new ones show immediately
  const [localAllTags, setLocalAllTags] = useState([...allTags]);
  // Tags selected for this flashcard
  const [selectedTags, setSelectedTags] = useState(currentTags || []);
  // New tag input field value
  const [newTag, setNewTag] = useState('');

  // Refs for the modal container and new tag input
  const containerRef = useRef(null);
  const newTagInputRef = useRef(null);

  // Key handler: Enter adds a new tag (if input is focused) or saves; Escape saves and closes.
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Enter') {
        if (document.activeElement === newTagInputRef.current) {
          e.preventDefault();
          handleAddNewTag();
        } else {
          e.preventDefault();
          handleSave();
        }
      } else if (e.key === 'Escape') {
        e.preventDefault();
        handleSave();
      }
    };
    const containerEl = containerRef.current;
    containerEl.addEventListener('keydown', handleKeyDown);
    return () => {
      containerEl.removeEventListener('keydown', handleKeyDown);
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
        backgroundColor: 'rgba(0,0,0,0.5)',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center'
      }}
    >
      <div style={{ backgroundColor: 'white', padding: '1rem', width: '300px', borderRadius: '5px' }}>
        <h2>Tag Flashcard</h2>
        
        {/* Existing Tags List */}
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

        {/* New Tag Input */}
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

        {/* Bottom Buttons: "Add Tag" on left, "Close" on right */}
        <div style={{ marginTop: '0.5rem', display: 'flex', justifyContent: 'space-between' }}>
          <button onClick={handleAddNewTag}>Add Tag</button>
          <button onClick={handleSave}>Close</button>
        </div>
      </div>
    </div>
  );
}

/* FlashcardItem:
   Renders a submitted flashcard with a header that displays:
   - "Edit" and "Tag" buttons on the left
   - A "Tags:" label and the list of tags on the right
   Below that, the front and back previews are displayed side by side.
*/
function FlashcardItem({ card, index, macros, onEdit, onTag }) {
  const frontRef = useRef(null);
  const backRef = useRef(null);

  useEffect(() => {
    const processText = (text) => text.replace(/\/\/+/g, "\n");
  
    // If you want to add \displaystyle for single-dollar delimiters, you can include that logic here
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
      {/* Header Row */}
      <div style={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center', 
        marginBottom: '0.5rem' 
      }}>
        <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
          <button onClick={onEdit} style={{ padding: '0.3rem 0.6rem' }}>Edit</button>
          <button onClick={onTag} style={{ padding: '0.3rem 0.6rem' }}>Tag</button>
        </div>
        <div>
          <strong>Tags:</strong> {card.tags && card.tags.length > 0 ? card.tags.join(', ') : 'None'}
        </div>
      </div>
      {/* Front/Back Previews */}
      <div style={{ display: 'flex', gap: '1rem' }}>
        <div style={{ flex: 1 }} ref={frontRef} />
        <div style={{ flex: 1 }} ref={backRef} />
      </div>
    </div>
  );
}

/* FlashcardApp: 
   Combines flashcard editing (with live previews), macros, flashcard listing, tagging,
   and export/import JSON functionality.
*/
function FlashcardApp() {
  const [front, setFront] = useState('');
  const [back, setBack] = useState('');
  const [flashcards, setFlashcards] = useState([]);
  const [editingIndex, setEditingIndex] = useState(null);

  // Macros state (for KaTeX and display)
  const [macros, setMacros] = useState({});
  const [macroList, setMacroList] = useState([]);

  // Control Macro Modal visibility
  const [showMacroModal, setShowMacroModal] = useState(false);

  // Tagging state
  const [allTags, setAllTags] = useState([]); // Global available tags
  const [tagModalFlashcardIndex, setTagModalFlashcardIndex] = useState(null);
  const [selectedTagFilter, setSelectedTagFilter] = useState('All');

  // Refs for live preview in the flashcard editor
  const frontPreviewRef = useRef(null);
  const backPreviewRef = useRef(null);

  // Update live previews when front/back/macros change
  useEffect(() => {
    const processText = (text) => text.replace(/\/\/+/g, "\n");

    // This function finds inline math (single $ delimiters) and adds \displaystyle
    const addDisplayStyle = (text) => {
      // Regex explanation:
      // (?<!\$)   => ensures the $ is not preceded by another $
      // \$        => match the opening single $
      // (?!\$)    => ensures the opening $ is not immediately followed by another $
      // ([\s\S]+?)=> lazily capture everything until the next $ (including newlines)
      // (?<!\$)   => ensures the closing $ is not preceded by another $
      // \$        => match the closing $
      // (?!\$)    => ensures the closing $ is not followed by another $
      const inlineRegex = /(?<!\$)\$(?!\$)([\s\S]+?)(?<!\$)\$(?!\$)/g;
      return text.replace(inlineRegex, (match, content) => `$\\displaystyle ${content}$`);
    };

    const processedFront = processText(front);
    const processedBack = processText(back);

    const processedFrontWithDisplay = addDisplayStyle(processedFront);
    const processedBackWithDisplay = addDisplayStyle(processedBack);

    if (frontPreviewRef.current) {
      frontPreviewRef.current.innerHTML = processedFrontWithDisplay;
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
      backPreviewRef.current.innerHTML = processedBackWithDisplay;
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

  // Tag modal handling
  const openTagModal = (index) => {
    setTagModalFlashcardIndex(index);
  };

  const handleSaveTags = (tags) => {
    if (tagModalFlashcardIndex === null) return;
    // Update global tags by merging in any new ones
    const newGlobalTags = [...allTags];
    tags.forEach(tag => {
      if (!newGlobalTags.includes(tag)) {
        newGlobalTags.push(tag);
      }
    });
    setAllTags(newGlobalTags);
    // Update the flashcard's tags
    const updatedFlashcards = flashcards.map((card, idx) =>
      idx === tagModalFlashcardIndex ? { ...card, tags } : card
    );
    setFlashcards(updatedFlashcards);
    setTagModalFlashcardIndex(null);
  };

  // Filter flashcards by tag
  const filteredFlashcards =
    selectedTagFilter === 'All'
      ? flashcards
      : flashcards.filter(card => card.tags && card.tags.includes(selectedTagFilter));

  // Macro functions
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

  // ----------------------------
  // Export / Import Functionality
  // ----------------------------
  const handleExport = async () => {
    const data = JSON.stringify({ flashcards, allTags, macroList }, null, 2);
    
    // Use the File System Access API if available.
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
        // Opens the native Save dialog.
        const fileHandle = await window.showSaveFilePicker(opts);
        const writableStream = await fileHandle.createWritable();
        await writableStream.write(data);
        await writableStream.close();
      } catch (err) {
        console.error('Export canceled or failed: ', err);
      }
    } else {
      // Fallback: create a blob and download it with a default name.
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
  };

  return (
    <div style={{ padding: '2rem' }}>
      <h1>LaTeX Flashcard Creator</h1>

      {/* Flashcard Editor: Side-by-side inputs */}
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

      {/* Controls: Macros, Submit Flashcard, Export/Import */}
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
      </div>

      {/* Filter by Tag */}
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
    </div>
  );
}

export default FlashcardApp;
