using System;
using Microsoft.MixedReality.Toolkit.UI;
using System.Collections;
using System.Collections.Generic;
using Drawing.Lines.Types.Enums;
using UnityEngine;

namespace Drawing
{
    public class HandDrawer3DUI : MonoBehaviour
    {
        [SerializeField] private GameObject _leftButtons;
        [SerializeField] private GameObject _rightButtons;
        
        [SerializeField] private HandDrawer3D _leftDrawer3D;
        [SerializeField] private HandDrawer3D _rightDrawer3D;
        [SerializeField] private Interactable _toggleDrawingButton;
        [SerializeField] private Interactable _freeformButton;
        [SerializeField] private Interactable _straightButton;
        [SerializeField] private Interactable _undoButton;
        [SerializeField] private Interactable _clearAllButton;
        [SerializeField] private Material _deselectedMaterial;
        [SerializeField] private Material _selectedMaterial;

        [SerializeField] private List<Interactable> _leftColourButtons;
        [SerializeField] private List<MeshRenderer> _leftColourButtonFrontPlates;
        [SerializeField] private List<Interactable> _leftSizingButtons;
        [SerializeField] private List<MeshRenderer> _leftSizingButtonFrontPlates;
        [SerializeField] private List<Interactable> _rightColourButtons;
        [SerializeField] private List<MeshRenderer> _rightColourButtonFrontPlates;
        [SerializeField] private List<Interactable> _rightSizingButtons;
        [SerializeField] private List<MeshRenderer> _rightSizingButtonFrontPlates;
        [SerializeField] private List<Material> _lineMaterials;
        private readonly List<float> _lineSize = new List<float>{0.01f, 0.005f, 0.001f};

        private List<HandDrawer3D> _drawers;
        private Stack<HandDrawer3D> _drawerLineAdditionStack;

        private void Start()
        {
            _drawers = new List<HandDrawer3D>{_leftDrawer3D, _rightDrawer3D};
            _drawerLineAdditionStack = new Stack<HandDrawer3D>();

            SetUpButtonListeners();

            _drawers.ForEach(drawer => drawer.LineUpdated += (sender, args) => OnLineUpdated());
            _drawers.ForEach(drawer => drawer.LineFinished += (sender, args) => OnLineAdded(sender, drawer));
            _drawers.ForEach(drawer => drawer.LinesRemoved += (sender, args) => OnLineCountUpdated());

            StartCoroutine(SetUpInNextFrame());
        }

        private void SetUpButtonListeners()
        {
            _toggleDrawingButton.OnClick.AddListener(OnToggleDrawingClicked);

            _freeformButton.OnClick.AddListener(OnFreeformButtonClicked);
            _straightButton.OnClick.AddListener(OnStraightButtonClicked);
            _undoButton.OnClick.AddListener(() =>
            {
                _drawerLineAdditionStack.Pop().RemoveLastPencilLine();
                if (_drawerLineAdditionStack.Count == 0) SetRemovalButtonsActive(false);
            });
            _clearAllButton.OnClick.AddListener(OnClearAllButtonClicked);

            ColorPicker.ColorPicker.MaterialColorChanged += (sender, material) =>
                (material.name.StartsWith("Left") ? _leftDrawer3D : _rightDrawer3D).SetLineMaterial(material);

                SetUpButtonCollection(_leftColourButtons, _leftColourButtonFrontPlates, _leftDrawer3D.SetLineMaterial, _lineMaterials);
            SetUpButtonCollection(_rightColourButtons, _rightColourButtonFrontPlates, _rightDrawer3D.SetLineMaterial, _lineMaterials);
            // SetUpButtonCollection(_leftSizingButtons, _leftSizingButtonFrontPlates, _leftDrawer3D.SetLineRadius, _lineSize);
            // SetUpButtonCollection(_rightSizingButtons, _rightSizingButtonFrontPlates, _rightDrawer3D.SetLineRadius, _lineSize);
        }

        private void OnToggleDrawingClicked()
        {
            _drawers.ForEach(drawer => drawer.CurrentState = _toggleDrawingButton.IsToggled ? drawer.PencilState : drawer.IdleState);

            SetDrawingButtonsActive(_toggleDrawingButton.IsToggled);
        }

        private void OnFreeformButtonClicked()
        {
            _drawers.ForEach(drawer => drawer.SetLineType(LineTypes.Freeform));

            _straightButton.IsToggled = false;
        }

        private void OnStraightButtonClicked()
        {
            _drawers.ForEach(drawer => drawer.SetLineType(LineTypes.Straight));

            _freeformButton.IsToggled = false;
        }

        private void OnClearAllButtonClicked()
        {
            _drawers.ForEach(drawer => drawer.RemoveAllLines());
            _drawerLineAdditionStack.Clear();
            SetRemovalButtonsActive(false);
        }
        
        private void SetUpButtonCollection<T>(IReadOnlyList<Interactable> buttonCollection, List<MeshRenderer> frontPlateCollection, Action<T> action, IReadOnlyList<T> modificationCollection)
        {
            for (int i = 0, numberOfButtons = buttonCollection.Count; i < numberOfButtons; i++)
            {
                int currentIndex = i;
                buttonCollection[currentIndex].OnClick.AddListener(() => ModificationButtonClicked(frontPlateCollection, action, modificationCollection, currentIndex));
            }
        }
        
        private void ModificationButtonClicked<T>(List<MeshRenderer> frontPlateCollection, Action<T> action, IReadOnlyList<T> modificationCollection, int currentIndex)
        {
            action.Invoke(modificationCollection[currentIndex]);
            frontPlateCollection.ForEach(frontPlate => frontPlate.material = _deselectedMaterial);
            frontPlateCollection[currentIndex].material = _selectedMaterial;
        }

        private void SetDrawingButtonsActive(bool activate)
        {
            _freeformButton.gameObject.SetActive(activate);
            _straightButton.gameObject.SetActive(activate);
            _leftButtons.gameObject.SetActive(activate);
            _rightButtons.gameObject.SetActive(activate);
        }

        private void SetRemovalButtonsActive(bool activate)
        {
            _undoButton.gameObject.SetActive(activate);
            _clearAllButton.gameObject.SetActive(activate);
        }

        private void OnLineUpdated()
        {
            if (_undoButton.gameObject.activeSelf && _drawers[0].CurrentState != _drawers[0].IdleState) SetRemovalButtonsActive(false);
        }
        
        private void OnLineAdded(object sender, HandDrawer3D drawer)
        {
            if (!(_undoButton.gameObject.activeSelf && _drawers[0].CurrentState != _drawers[0].IdleState)) SetRemovalButtonsActive(true);
            
            _drawerLineAdditionStack.Push(sender as HandDrawer3D);
            OnLineCountUpdated();
        }

        private void OnLineCountUpdated() => SetRemovalButtonsActive(_drawerLineAdditionStack.Count > 0);

        private IEnumerator SetUpInNextFrame()
        {
            yield return null;

            _toggleDrawingButton.IsToggled = false;
            _drawers.ForEach(drawer => drawer.CurrentState = drawer.IdleState);
            SetDrawingButtonsActive(false);
            SetRemovalButtonsActive(false);

            _freeformButton.IsToggled = true;
            _straightButton.IsToggled = false;

            _leftColourButtonFrontPlates[3].material = _selectedMaterial;
            _leftSizingButtonFrontPlates[0].material = _selectedMaterial;
            _rightColourButtonFrontPlates[3].material = _selectedMaterial;
            _rightSizingButtonFrontPlates[0].material = _selectedMaterial;
        }
    }
}
