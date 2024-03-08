import { useNavigate } from 'react-router-dom'
import styles from '../styles/Home.module.css'
import { useEffect, useState } from 'react'
import clsx from 'clsx'

export default function Home(): JSX.Element {
  interface Question {
    id: string
    question: string
    choices: { choice: string; isTrue: boolean }[]
    comments: string
    tag: string
    assets: string
    createdAt: Date
  }

  const navigate = useNavigate()
  function handleCreate(): void {
    navigate('/create')
  }

  const [questions, setQuestions] = useState<Question[]>([])
  const [selectedQuestion, setSelectQuestion] = useState<Question | undefined>()
  const [userChoiceId, setUserChoiceId] = useState<string | null>(null)
  const [userChoiceIsTrue, setUserChoiceIsTrue] = useState<boolean | null>(null)
  const [lastSeen, setLastSeen] = useState<string | null>(null)
  const [comments, setComments] = useState<string | null>(null)
  const [commentSaved, setCommentSaved] = useState(false)
  const [showAnswer, setShowAnswer] = useState(false)

  const [searchTerm, setSearchTerm] = useState('')
  const [filteredQuestions, setFilteredQuestions] = useState<Question[]>([])

  const [isEditing, setIsEditing] = useState()

  async function getData(): Promise<void> {
    const fetchedData = await window.electron.ipcRenderer.invoke('getData')
    setQuestions(fetchedData)
    console.log(fetchedData)
  }

  async function handleSelect(question): Promise<void> {
    setUserChoiceId(null)
    setComments('')
    setCommentSaved(null)
    setShowAnswer(null)
    setSelectQuestion(question)
    const lastSeenDate = await window.electron.ipcRenderer.invoke('getLastSeen', question)
    setLastSeen(lastSeenDate)
  }

  async function handleAnswer(): Promise<void> {
    const response = await window.electron.ipcRenderer.invoke(
      'saveChoice',
      userChoiceId,
      selectedQuestion
    )
    console.log('User choice is:', userChoiceIsTrue)
    console.log('Selected question is:', selectedQuestion)
    setShowAnswer(true)
    setUserChoiceId(null)
    getData()
    return response
  }

  async function handleSave() {
    if (comments !== '') {
      const { id } = selectedQuestion
      window.electron.ipcRenderer.invoke('saveComments', comments, id)
      setCommentSaved(true)
    }
  }

  async function handleDelete() {
    console.log('This choice will be deleted: ', selectedQuestion)
    await window.electron.ipcRenderer.invoke('deleteQuestion', selectedQuestion)
    await getData()
    setSelectQuestion()
  }

  async function handleEditMode() {
    setIsEditing(!isEditing)
    console.log('Edit mode', isEditing)
    if (selectedQuestion && isEditing === true) {
      console.log('New tag is:', selectedQuestion?.tag)
      console.log('Question edited for:', selectedQuestion?.question)
      await window.electron.ipcRenderer.invoke('updateQuestion', selectedQuestion)
    }
  }

  async function handleEdit(event, property) {
    if (selectedQuestion) {
      const editedQuestion = { ...selectedQuestion, [property]: event.target.value }
      setSelectQuestion(editedQuestion)
    }
  }

  useEffect(() => {
    const results = questions.filter((question) =>
      question.tag.toLowerCase().includes(searchTerm.toLowerCase())
    )
    setFilteredQuestions(results)
  }, [searchTerm, questions])

  const ipcHandle = (): void => window.electron.ipcRenderer.send('ping')

  return (
    <>
      <div className={styles.main}>
        {/* LEFT SCREEN */}
        <div className={styles.body}>
          <div className={styles.tableContainer}>
            <div className={styles.searchField}>
              <input
                type="search"
                placeholder="Search by tag"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />

              <div className={styles.btnContainer}>
                <button onClick={getData}>Refresh</button>
                <button class="outline" onClick={handleCreate}>
                  Create
                </button>
              </div>
            </div>

            <hr></hr>

            <table>
              <thead style={{ fontSize: '0.8rem' }}>
                <th scope="col" className={styles.questionColumn}>
                  Question
                </th>
                <th scope="col" className={styles.tagColumn}>
                  Tag
                </th>
                <th scope="col">#</th>
              </thead>
              <tbody>
                {filteredQuestions.map((question) => (
                  <tr
                    key={question.id}
                    style={{ fontSize: '0.8rem' }}
                    onClick={() => handleSelect(question)}
                  >
                    <td className={styles.truncate}>{question.question}</td>
                    <td>{question.tag}</td>
                    <td>{question.userChoice.length}</td>
                  </tr>
                ))}
              </tbody>
              <tfoot>
                <tr>
                  <th scope="row">Total</th>
                  <td></td>
                  <td>{filteredQuestions.length}</td>
                </tr>
              </tfoot>
            </table>
          </div>
          {/* RIGHT SCREEN */}
          <div className={styles.questionContainer}>
            <div className={styles.questionData}>
              {isEditing ? (
                <div className={styles.tagEdit}>
                  <input
                    value={selectedQuestion ? selectedQuestion.tag : null}
                    onChange={(e) => handleEdit(e, 'tag')}
                  />
                </div>
              ) : (
                <div className={styles.topContainer}>
                  <span
                    className={clsx({
                      [styles.trueColor]: userChoiceIsTrue,
                      [styles.falseColor]: !userChoiceIsTrue
                    })}
                  >
                    {showAnswer ? (userChoiceIsTrue ? 'True' : 'False') : null}
                  </span>

                  <span className={styles.lastSeen}>
                    Last seen:{' '}
                    {lastSeen
                      ? new Date(lastSeen).toLocaleString('pt-BR', {
                          year: 'numeric',
                          month: '2-digit',
                          day: '2-digit'
                        })
                      : 'never'}
                  </span>
                </div>
              )}
              <details>
                <summary role="button">Question</summary>
                {isEditing ? (
                  <textarea
                    name="edition"
                    spellCheck="false"
                    value={selectedQuestion ? selectedQuestion.question : 'No question selected.'}
                    onChange={(e) => handleEdit(e, 'question')}
                    rows="11"
                  ></textarea>
                ) : (
                  <p>{selectedQuestion ? selectedQuestion.question : 'No question selected.'}</p>
                )}
              </details>
              <details>
                <summary role="button" className="outline contrast">
                  Choices
                </summary>
                <fieldset>
                  {selectedQuestion?.choices.map((choice, index) => (
                    <label key={index} htmlFor={`choice-${index}`}>
                      <input
                        type="radio"
                        name="choice"
                        id={`choice-${index}`}
                        value={choice.id}
                        checked={userChoiceId === choice.id}
                        onChange={(e) => {
                          setUserChoiceId(e.target.value)
                          const selectedChoice = selectedQuestion.choices.find(
                            (c) => c.id === e.target.value
                          )
                          if (selectedChoice) {
                            setUserChoiceIsTrue(selectedChoice.isTrue)
                          }
                        }}
                      />
                      {choice.choice}
                    </label>
                  ))}
                </fieldset>
              </details>
              <details>
                <summary role="button" className="outline contrast">
                  Comments
                </summary>
                <textarea
                  placeholder={
                    selectedQuestion ? selectedQuestion.comments : 'No comments available.'
                  }
                  onChange={(e) => setComments(e.target.value)}
                  value={comments}
                  rows="5"
                  spellCheck="false"
                />
                {commentSaved ? <p>Comment saved.</p> : null}
              </details>
            </div>
            <div className={styles.btnContainer}>
              <button onClick={handleAnswer}>Answer</button>
              <button class="outline" onClick={handleSave}>
                Save
              </button>
              <button class="secondary" onClick={handleDelete}>
                Delete
              </button>
              <button
                onClick={handleEditMode}
                className={clsx('secondary', { contrast: isEditing })}
                onClick={handleEditMode}
              >
                Edit
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}
