import Rekv from 'rekv'

const store = new Rekv({
  currentStep: 0,
  sourceAddr: '',
  targetAddr: '',
  selectedData: null,
})

export default store
