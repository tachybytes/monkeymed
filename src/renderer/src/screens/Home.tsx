import { useNavigate } from 'react-router-dom'
import styles from '../styles/Home.module.css'
import { useEffect, useState } from 'react'
import clsx from 'clsx'

export default function Home(): JSX.Element {
  interface Question {
    id: string
    question: string
    choices: { choice: string; isTrue: boolean }[]
    tags: string[]
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

  const [clock, setClock] = useState()
  const [t0, setT0] = useState<number | null>(null)
  const [delta, setDelta] = useState()

  const [newTag, setNewTag] = useState('')
  const [tags, setTags] = useState()

  async function getData(): Promise<void> {
    const fetchedData = await window.electron.ipcRenderer.invoke('getData')
    setQuestions(fetchedData)
  }

  async function handleSelect(question): Promise<void> {
    setUserChoiceId(null)
    setComments('')
    setCommentSaved(null)
    setShowAnswer(null)
    setSelectQuestion(question)
    const lastSeenDate = await window.electron.ipcRenderer.invoke('getLastSeen', question)
    setLastSeen(lastSeenDate)
    // Start the timer
    const startTime = Date.now()
    setT0(startTime)
    setClock(t0)
    console.log(selectedQuestion)
  }

  async function handleAnswer(): Promise<void> {
    const delta = stopClock()
    console.log('Time taken in seconds:', delta / 1000)
    setDelta(delta)
    const response = await window.electron.ipcRenderer.invoke(
      'saveChoice',
      userChoiceId,
      selectedQuestion,
      delta
    )
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
    if (selectedQuestion) {
      setIsEditing(!isEditing)
    }
    console.log('Edit mode', isEditing)
    if (selectedQuestion && isEditing === true) {
      console.log('New tags are', tags)
      await window.electron.ipcRenderer.invoke('updateQuestion', selectedQuestion, tags)
    }
  }

  async function handleEdit(event, property) {
    if (selectedQuestion) {
      const editedQuestion = { ...selectedQuestion, [property]: event.target.value }
      setSelectQuestion(editedQuestion)
    }
  }

  useEffect(() => {
    {/* search by tag */}
    const results = questions.filter((question) =>
    question.tags.some((tag) => tag.tag.toLowerCase().includes(searchTerm.toLowerCase()))
    )
    setFilteredQuestions(results)
  }, [searchTerm, questions])

  function stopClock() {
    const t1 = Date.now()
    const delta = t1 - t0
    return delta
  }

  useEffect(() => {
    if (selectedQuestion) {
      setTags(selectedQuestion?.tags.map((tagObject) => tagObject.tag))
    } else {
      setTags([])
    }
  }, [selectedQuestion])

  function addTag() {
    setTags([...tags, newTag])
    setNewTag('')
    console.log('New tags are:', tags)
  }

  function removeTag(index: number) {
    setTags(tags.filter((_, i) => i !== index))
    console.log(tags)
  }

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
                <button disabled class="outline">
                  Benchmark
                </button>
              </div>
            </div>
            <hr></hr>
            <table>
              <thead style={{ fontSize: '0.7rem' }}>
                <th scope="col" className={styles.questionColumn}>
                  Question
                </th>
                <th scope="col" className={styles.tagColumn}>
                  Tag
                </th>
                <th scope="col" className={styles.numberColumn}>
                  #
                </th>

                <th scope="col" className={styles.numberColumn}>
                  %
                </th>
              </thead>
              <tbody>
                {filteredQuestions.map((question) => {
                  const totalChoices = question.userChoice.length
                  const trueChoices = question.userChoice.filter(
                    (choice) => choice.userChoice.isTrue
                  ).length
                  const percentage = ((trueChoices / totalChoices) * 100).toFixed(0)
                  const tags = question.tags.map((tag, index) => (
                    <span key={index} className={styles.tag}>
                      {tag.tag}
                    </span>
                  ))
                  return (
                    <tr
                      key={question.id}
                      style={{ fontSize: '0.8rem' }}
                      onClick={() => handleSelect(question)}
                    >
                      <td className={styles.truncate}>{question.question}</td>
                      <td>{tags}</td>

                      <td style={{ fontSize: '0.6rem' }}>{totalChoices}</td>
                      <td style={{ fontSize: '0.6rem' }}>{trueChoices}</td>
                    </tr>
                  )
                })}
              </tbody>
              <tfoot>
                <tr>
                  <th scope="row">Total</th>
                  <td>{filteredQuestions.length}</td>
                  <td></td>
                  <td></td>
                </tr>
              </tfoot>
            </table>
          </div>
          {/* RIGHT SCREEN */}
          <div className={styles.questionContainer}>
            <div className={styles.questionData}>
              {isEditing ? (
                <div>
                  <div>
                    {tags?.map((tag, index) => (
                      <span key={index} className={styles.tag} onClick={() => removeTag(index)}>
                        {tag}
                      </span>
                    ))}
                  </div>
                  <div className={styles.tagEdit}>
                    <input
                      placeholder="tag"
                      value={newTag}
                      onChange={(e) => setNewTag(e.target.value)}
                    />
                    <button onClick={addTag}>Add Tag</button>
                  </div>
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
                    {showAnswer ? (
                      <div>Time taken: {delta / 1000} seconds</div>
                    ) : (
                      <div>
                        Last seen:{' '}
                        {lastSeen
                          ? new Date(lastSeen).toLocaleString('pt-BR', {
                              year: 'numeric',
                              month: '2-digit',
                              day: '2-digit'
                            })
                          : 'never'}
                      </div>
                    )}
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
