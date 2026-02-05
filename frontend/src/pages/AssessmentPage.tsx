import React, { useState } from 'react'
import { Card, Button, Radio, Progress, message, Select } from 'antd'
import { api } from '../api'

const { Option } = Select

export default function AssessmentPage() {
  const [scaleType, setScaleType] = useState<string>('phq_9')
  const [currentQuestion, setCurrentQuestion] = useState(0)
  const [answers, setAnswers] = useState<number[]>([])
  const [result, setResult] = useState<any>(null)
  const [loading, setLoading] = useState(false)

  const scales = {
    phq_9: {
      title: 'PHQ-9 抑郁症状评估',
      description: '评估您最近两周的抑郁症状',
      questions: [
        '做事时提不起劲或没有兴趣',
        '感到心情低落、沮丧或绝望',
        '入睡困难、睡不安稳或睡眠过多',
        '感到疲倦或没有活力',
        '食欲不振或吃得太多',
        '觉得自己很糟，或觉得自己很失败，让自己或家人失望',
        '对事物专注有困难，例如阅读报纸或看电视时',
        '动作、说话速度缓慢到别人已经察觉，或正好相反，烦躁或坐立不安',
        '有不如死掉或用某种方式伤害自己的念头',
      ],
      options: ['完全不会', '好几天', '一半以上的天数', '几乎每天'],
    },
    gad_7: {
      title: 'GAD-7 焦虑症状评估',
      description: '评估您最近两周的焦虑症状',
      questions: [
        '感到紧张、焦虑或急切',
        '不能停止或控制担忧',
        '对各种各样的事情担忧过多',
        '很难放松下来',
        '由于不安而无法静坐',
        '变得容易烦恼或急躁',
        '感到好像有什么可怕的事发生',
      ],
      options: ['完全不会', '好几天', '一半以上的天数', '几乎每天'],
    },
    pss_10: {
      title: 'PSS-10 压力水平评估',
      description: '评估您最近一个月的压力水平',
      questions: [
        '因意外发生的事情而心烦意乱',
        '感觉无法控制生活中的重要事情',
        '感觉神经紧张，压力很大',
        '感到自信心不足以处理个人问题',
        '感觉事情并非按预期发展',
        '发现自己无法应付所有必须做的事情',
        '因为事情超出控制而愤怒',
        '感觉问题堆积如山，无法克服',
        '经常生气，因为事情超出控制',
        '感觉问题堆积如山，无法克服',
      ],
      options: ['从不', '几乎从不', '有时', '经常', '很经常'],
    },
  }

  const currentScale = scales[scaleType as keyof typeof scales]
  const questions = currentScale?.questions || []
  const options = currentScale?.options || []

  const handleScaleChange = (value: string) => {
    setScaleType(value)
    setCurrentQuestion(0)
    setAnswers([])
    setResult(null)
  }

  const handleAnswer = (value: number) => {
    const newAnswers = [...answers, value]
    setAnswers(newAnswers)

    if (currentQuestion < questions.length - 1) {
      setCurrentQuestion(currentQuestion + 1)
    } else {
      handleSubmit(newAnswers)
    }
  }

  const handleSubmit = async (finalAnswers: number[]) => {
    setLoading(true)
    try {
      const data = await api.assessment.submitAssessment(scaleType, finalAnswers)
      setResult(data)
    } catch (error) {
      message.error('提交评估失败，请重试')
    } finally {
      setLoading(false)
    }
  }

  const handleReset = () => {
    setCurrentQuestion(0)
    setAnswers([])
    setResult(null)
  }

  if (result) {
    return (
      <Card title="评估结果">
        <div style={{ textAlign: 'center', padding: '40px' }}>
          <h2>{currentScale.title}</h2>
          <div style={{ fontSize: '48px', color: '#1890ff', margin: '20px 0' }}>
            {result.score}
          </div>
          <h3 style={{ marginBottom: '30px' }}>{result.level}</h3>
          <Button type="primary" onClick={handleReset}>
            重新评估
          </Button>
        </div>
      </Card>
    )
  }

  return (
    <Card title={currentScale.title}>
      <div style={{ marginBottom: '20px' }}>
        <Select
          value={scaleType}
          onChange={handleScaleChange}
          style={{ width: 200 }}
        >
          <Option value="phq_9">PHQ-9 抑郁评估</Option>
          <Option value="gad_7">GAD-7 焦虑评估</Option>
          <Option value="pss_10">PSS-10 压力评估</Option>
        </Select>
        <p style={{ marginTop: '10px', color: '#666' }}>{currentScale.description}</p>
      </div>

      <div style={{ marginBottom: '20px' }}>
        <Progress
          percent={((currentQuestion + 1) / questions.length) * 100}
          showInfo={false}
        />
        <p style={{ textAlign: 'center', marginTop: '10px' }}>
          {currentQuestion + 1} / {questions.length}
        </p>
      </div>

      <div style={{ marginBottom: '30px' }}>
        <h3>{questions[currentQuestion]}</h3>
      </div>

      <Radio.Group
        style={{ width: '100%' }}
        onChange={(e) => handleAnswer(e.target.value)}
        disabled={loading}
      >
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          {options.map((option, index) => (
            <Radio key={index} value={index}>
              {option}
            </Radio>
          ))}
        </div>
      </Radio.Group>
    </Card>
  )
}