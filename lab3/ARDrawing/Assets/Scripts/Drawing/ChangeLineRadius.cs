using System.Collections;
using System.Collections.Generic;
using Microsoft.MixedReality.Toolkit.UI;
using UnityEngine;

namespace Drawing
{
    public class ChangeLineRadius : MonoBehaviour
    {
        [SerializeField] private List<HandDrawer3D> _handDrawer3Ds;
        [SerializeField] private HandDrawer3D _handDrawer3D;
        [SerializeField] private PinchSlider _slider;

        private void Start()
        {
            _slider.OnValueUpdated.AddListener(UpdateLineRadius);
            _slider.OnHoverEntered.AddListener(_ => _handDrawer3Ds.ForEach(drawer => drawer.ChangeState(drawer.IdleState)));
            _slider.OnHoverExited.AddListener(_ => StartCoroutine(DelayStateChange()));
        }

        private void UpdateLineRadius(SliderEventData data)
        {
            float newValue = data.NewValue * (_handDrawer3D.maxLineRadius - _handDrawer3D.minLineRadius) +
                             _handDrawer3D.minLineRadius;
            _handDrawer3D.SetLineRadius(newValue);
        }

        
        private IEnumerator DelayStateChange()
        {
            yield return null;
            _handDrawer3Ds.ForEach(drawer => drawer.ChangeState(drawer.PencilState));
        }
    }
}