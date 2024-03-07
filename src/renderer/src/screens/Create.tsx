import { useNavigate } from 'react-router-dom'
import styles from '../styles/Create.module.css'
import { useState } from 'react'

export default function Create(): JSX.Element {
  const [question, setQuestion] = useState<string>('')
  const [choices, setChoices] = useState<{ text: string; isTrue: boolean }[]>([
    { text: '', isTrue: false }
  ])
  const [tag, setTag] = useState<string>()

  const navigate = useNavigate()

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
    console.log(question)
    console.log(choices)
    console.log(tag)
    window.electron.ipcRenderer.invoke('createQuestion', question, choices, tag)
    setQuestion('')
    setChoices([{ text: '', isTrue: false }])
  }

  return (
    <>
      <div className={styles.main}>
        <div className={styles.body}>
          <div>
            <input placeholder="Tag" onChange={(e) => setTag(e.target.value)} />
          </div>
          <details>
            <summary role="button">Question</summary>
            <textarea
              name="question"
              onChange={(e) => setQuestion(e.target.value)}
              value={question}
              placeholder='Create question'
            />
            <input type="file" />
          </details>

          <details>
            <summary role="button" className="outline contrast">
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
                    onChange={(e) => handleChoiceChange(index, e.target.value)}
                    value={choice.text}
                  ></textarea>
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
          <button className="outline" onClick={handleClick}>
            Home
          </button>
        </div>
      </div>
    </>
  )
}
