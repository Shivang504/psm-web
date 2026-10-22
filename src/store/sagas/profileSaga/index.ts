import { takeLatest } from 'redux-saga/effects'
import { sagaActions } from '../../actions'
import { genericSaga } from '../genericSaga/genericSaga'

export function* profileSaga() {
  yield takeLatest(sagaActions.GET_PROFILE, genericSaga)
}
