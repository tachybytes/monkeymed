import { useNavigate } from 'react-router-dom'
import styles from '../styles/Create.module.css'
import { useState } from 'react'

export default function Create(): JSX.Element {
  const [question, setQuestion] = useState<string>('')
  const [choices, setChoices] = useState<{ text: string; isTrue: boolean }[]>([
    { text: '', isTrue: false }
  ])

  const [newTag, setNewTag] = useState<string>('')
  const [tags, setTags] = useState<string[]>([])

  const navigate = useNavigate()

  function addTag() {
    if (newTag.trim() !== '') {
      setTags([...tags, newTag.trim()])
      setNewTag('') // Clear the input after adding the tag
    }
  }

  function removeTag(index: number) {
    setTags(tags.filter((_, i) => i !== index))
  }

  function handleChoiceChange(index: number, value: string) {
    const updatedChoices = choices.map((choice, i) =>
      i === index ? { ...choice, text: value } : choice
    )
    setChoices(updatedChoices)
  }

  function handleChoiceCorrectness(index: number, isTrue: boolean) {
    const updatedChoices = choices.map((choice, i) =>
      i === index ? { ...choice, isTrue } : choice
    )
    setChoices(updatedChoices)
  }

  function addChoice() {
    setChoices([...choices, { text: '', isTrue: false }])
  }

  function removeChoice() {
    setChoices(choices.slice(0, -1)) // Removes the last choice
  }

  function handleClick() {
    navigate('/')
  }

  function handleSave() {
    if (question != '' && tags != '') {
      console.log(question)
      console.log(choices)
      window.electron.ipcRenderer.invoke('createQuestion', question, choices, tags)
      setQuestion('')
      setChoices([{ text: '', isTrue: false }])
    } else {
      console.log('Empty field.')
      console.log(choices)
    }
  }

  return (
    <>
      <div className={styles.main}>
        <div className={styles.body}>
          <div>
            <div className={styles.addTagsRow}>
              <input placeholder="Tag" value={newTag} onChange={(e) => setNewTag(e.target.value)} />
              <button onClick={addTag} className={styles.addTagBtn}>
                Add Tag
              </button>
              <div className={styles.newTags}>
                {tags.map((tag, index) => (
                  <div key={index}>
                    <button class="outline" onClick={() => removeTag(index)}>
                      {tag}
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>
          <details>
            <summary role="button">Question</summary>
            <textarea
              name="question"
              onChange={(e) => {
                // Substitui todas as quebras de linha por espaços
                const valueWithoutLineBreaks = e.target.value.replace(/\n/g, ' ')
                setQuestion(valueWithoutLineBreaks)
              }}
              value={question}
              placeholder="Create question"
              spellCheck="false"
            />
            <input type="file" />
          </details>
          <details>
            <summary role="button" class="secondary outline">
              Choices
            </summary>
            <div className={styles.choicesContainer}>
              {choices.map((choice, index) => (
                <div key={index}>
                  <div className={styles.switchContainer}>
                    <input
                      name="isTrue"
                      type="checkbox"
                      role="switch"
                      id={`choice${index}`}
                      checked={choice.isTrue}
                      onChange={(e) => handleChoiceCorrectness(index, e.target.checked)}
                    />
                  </div>
                  <textarea
                    name="choice"
                    placeholder={`Choice ${index + 1}`}
                    onChange={(e) => {
                      // Substitui todas as quebras de linha por espaços
                      const valueWithoutLineBreaks = e.target.value.replace(/\n/g, ' ')
                      handleChoiceChange(index, valueWithoutLineBreaks)
                    }}
                    value={choice.text}
                    spellCheck="false"
                  />
                </div>
              ))}
            </div>
          </details>
        </div>

        <hr />
        <div className={styles.btnContainer}>
          <button onClick={handleSave}>Save</button>
          <button class="secondary" onClick={addChoice}>
            Add choice
          </button>
          <button class="secondary" onClick={removeChoice}>
            Remove choice
          </button>
          <button className="outline secondary" onClick={handleClick}>
            Home
          </button>
        </div>
      </div>
    </>
  )
}
